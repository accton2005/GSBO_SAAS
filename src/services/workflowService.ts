import { 
  collection, 
  doc, 
  addDoc, 
  updateDoc, 
  getDoc, 
  getDocs, 
  query, 
  where, 
  orderBy, 
  serverTimestamp,
  Timestamp,
  deleteDoc
} from 'firebase/firestore';
import { db } from '../firebase';
import { 
  WorkflowDefinition, 
  WorkflowStep, 
  WorkflowInstance, 
  WorkflowInstanceStep, 
  WorkflowAction,
  WorkflowStatus,
  WorkflowActionType,
  Courrier
} from '../types';

const WORKFLOW_DEFINITIONS = 'workflow_definitions';
const WORKFLOW_STEPS = 'workflow_steps';
const WORKFLOW_INSTANCES = 'workflow_instances';
const WORKFLOW_INSTANCE_STEPS = 'workflow_instance_steps';
const WORKFLOW_ACTIONS = 'workflow_actions';

export const workflowService = {
  // Workflow Definitions
  async createWorkflowDefinition(organizationId: string, name: string, description: string) {
    const docRef = await addDoc(collection(db, WORKFLOW_DEFINITIONS), {
      organizationId,
      name,
      description,
      createdAt: new Date().toISOString()
    });
    return docRef.id;
  },

  async getWorkflowDefinitions(organizationId: string) {
    const q = query(collection(db, WORKFLOW_DEFINITIONS), where('organizationId', '==', organizationId));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as WorkflowDefinition));
  },

  async getWorkflowDefinition(id: string) {
    const docRef = doc(db, WORKFLOW_DEFINITIONS, id);
    const snapshot = await getDoc(docRef);
    if (snapshot.exists()) {
      return { id: snapshot.id, ...snapshot.data() } as WorkflowDefinition;
    }
    return null;
  },

  // Workflow Steps
  async createWorkflowStep(step: Omit<WorkflowStep, 'id' | 'createdAt'>) {
    const docRef = await addDoc(collection(db, WORKFLOW_STEPS), {
      ...step,
      createdAt: new Date().toISOString()
    });
    return docRef.id;
  },

  async getWorkflowSteps(workflowId: string) {
    const q = query(collection(db, WORKFLOW_STEPS), where('workflowId', '==', workflowId), orderBy('order', 'asc'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as WorkflowStep));
  },

  async updateWorkflowStep(id: string, updates: Partial<WorkflowStep>) {
    const docRef = doc(db, WORKFLOW_STEPS, id);
    await updateDoc(docRef, updates);
  },

  async deleteWorkflowStep(id: string) {
    await deleteDoc(doc(db, WORKFLOW_STEPS, id));
  },

  // Workflow Instances
  async startWorkflow(courrierId: string, workflowId: string) {
    // 1. Create instance
    const instanceRef = await addDoc(collection(db, WORKFLOW_INSTANCES), {
      courrierId,
      workflowId,
      currentStepIndex: 0,
      status: 'en_cours',
      startedAt: new Date().toISOString()
    });

    // 2. Get steps
    const steps = await this.getWorkflowSteps(workflowId);

    // 3. Create instance steps
    for (const step of steps) {
      await addDoc(collection(db, WORKFLOW_INSTANCE_STEPS), {
        instanceId: instanceRef.id,
        stepId: step.id,
        status: step.order === 0 ? 'en_cours' : 'en_attente',
      });
    }

    // 4. Update courrier status
    const courrierRef = doc(db, 'courriers', courrierId);
    await updateDoc(courrierRef, {
      status: 'en_workflow',
      workflowInstanceId: instanceRef.id
    });

    return instanceRef.id;
  },

  async getWorkflowInstance(id: string) {
    const docRef = doc(db, WORKFLOW_INSTANCES, id);
    const snapshot = await getDoc(docRef);
    if (snapshot.exists()) {
      return { id: snapshot.id, ...snapshot.data() } as WorkflowInstance;
    }
    return null;
  },

  async getWorkflowInstanceSteps(instanceId: string) {
    const q = query(collection(db, WORKFLOW_INSTANCE_STEPS), where('instanceId', '==', instanceId));
    const snapshot = await getDocs(q);
    // We need to sort them by the original step order
    const instanceSteps = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as WorkflowInstanceStep));
    
    // Fetch step details to sort
    const steps = await Promise.all(instanceSteps.map(is => getDoc(doc(db, WORKFLOW_STEPS, is.stepId))));
    const stepsData = steps.map(s => ({ id: s.id, ...s.data() } as WorkflowStep));
    
    return instanceSteps.sort((a, b) => {
      const stepA = stepsData.find(s => s.id === a.stepId);
      const stepB = stepsData.find(s => s.id === b.stepId);
      return (stepA?.order || 0) - (stepB?.order || 0);
    });
  },

  // Workflow Actions
  async performAction(
    instanceId: string, 
    instanceStepId: string, 
    userId: string, 
    actionType: WorkflowActionType, 
    comment: string
  ) {
    // 1. Log action
    await addDoc(collection(db, WORKFLOW_ACTIONS), {
      instanceStepId,
      actionType,
      userId,
      comment,
      timestamp: new Date().toISOString()
    });

    // 2. Update current step status
    const stepRef = doc(db, WORKFLOW_INSTANCE_STEPS, instanceStepId);
    let stepStatus: WorkflowStatus = 'valide';
    if (actionType === 'refuser') stepStatus = 'refuse';
    
    await updateDoc(stepRef, {
      status: stepStatus,
      comment,
      actionDate: new Date().toISOString(),
      assignedUser: userId
    });

    // 3. Move to next step if validated
    if (actionType === 'valider') {
      const instance = await this.getWorkflowInstance(instanceId);
      if (instance) {
        const steps = await this.getWorkflowSteps(instance.workflowId);
        const nextStepIndex = instance.currentStepIndex + 1;

        if (nextStepIndex < steps.length) {
          // Update instance
          await updateDoc(doc(db, WORKFLOW_INSTANCES, instanceId), {
            currentStepIndex: nextStepIndex
          });

          // Set next step to 'en_cours'
          const nextStep = steps[nextStepIndex];
          const instanceStepsQ = query(
            collection(db, WORKFLOW_INSTANCE_STEPS), 
            where('instanceId', '==', instanceId),
            where('stepId', '==', nextStep.id)
          );
          const instanceStepsSnapshot = await getDocs(instanceStepsQ);
          if (!instanceStepsSnapshot.empty) {
            await updateDoc(doc(db, WORKFLOW_INSTANCE_STEPS, instanceStepsSnapshot.docs[0].id), {
              status: 'en_cours'
            });
          }
        } else {
          // Workflow completed
          await updateDoc(doc(db, WORKFLOW_INSTANCES, instanceId), {
            status: 'termine',
            completedAt: new Date().toISOString()
          });

          // Update courrier status
          const courrierId = instance.courrierId;
          await updateDoc(doc(db, 'courriers', courrierId), {
            status: 'traite'
          });
        }
      }
    } else if (actionType === 'refuser') {
        // Workflow refused
        await updateDoc(doc(db, WORKFLOW_INSTANCES, instanceId), {
            status: 'refuse',
            completedAt: new Date().toISOString()
        });
    }
  },

  async getWorkflowActions(instanceStepId: string) {
    const q = query(collection(db, WORKFLOW_ACTIONS), where('instanceStepId', '==', instanceStepId), orderBy('timestamp', 'asc'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as WorkflowAction));
  }
};
