import React from 'react';
import { ManagementList } from './ManagementList';

export const TypeManagement: React.FC<{ organizationId: string }> = ({ organizationId }) => (
  <ManagementList
    organizationId={organizationId}
    title="Gestion des Types de Courriers"
    type="types"
    fields={[
      { name: 'name', label: 'Nom du type', type: 'text', placeholder: 'ex: Lettre officielle' },
      { name: 'code', label: 'Code', type: 'text', placeholder: 'ex: LO' },
      { name: 'description', label: 'Description', type: 'text' }
    ]}
  />
);

export const StatusManagement: React.FC<{ organizationId: string }> = ({ organizationId }) => (
  <ManagementList
    organizationId={organizationId}
    title="Gestion des Statuts"
    type="statuses"
    fields={[
      { name: 'name', label: 'Nom du statut', type: 'text', placeholder: 'ex: En traitement' },
      { name: 'color', label: 'Couleur', type: 'color' },
      { name: 'order', label: 'Ordre d\'affichage', type: 'number' }
    ]}
  />
);

export const PriorityManagement: React.FC<{ organizationId: string }> = ({ organizationId }) => (
  <ManagementList
    organizationId={organizationId}
    title="Gestion des Priorités"
    type="priorities"
    fields={[
      { name: 'name', label: 'Nom de la priorité', type: 'text', placeholder: 'ex: Urgent' },
      { name: 'color', label: 'Couleur', type: 'color' },
      { name: 'maxProcessingDays', label: 'Délai max (jours)', type: 'number' }
    ]}
  />
);
