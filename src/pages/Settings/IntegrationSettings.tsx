import React, { useState } from 'react';
import { Mail, Key, Webhook as WebhookIcon, Activity } from 'lucide-react';
import { SMTPSettings } from './IntegrationSettings/SMTPSettings';
import { APISettings } from './IntegrationSettings/APISettings';
import { WebhookSettings } from './IntegrationSettings/WebhookSettings';
import { APILogs } from './IntegrationSettings/APILogs';

interface IntegrationSettingsProps {
  organizationId: string;
}

export const IntegrationSettings: React.FC<IntegrationSettingsProps> = ({ organizationId }) => {
  const [activeSubTab, setActiveSubTab] = useState<'smtp' | 'api' | 'webhooks' | 'logs'>('smtp');

  const subTabs = [
    { id: 'smtp', label: 'Configuration SMTP', icon: Mail },
    { id: 'api', label: 'API REST', icon: Key },
    { id: 'webhooks', label: 'Webhooks', icon: WebhookIcon },
    { id: 'logs', label: 'Logs API', icon: Activity },
  ];

  return (
    <div className="space-y-6">
      <div className="flex border-b border-slate-100">
        {subTabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveSubTab(tab.id as any)}
            className={`flex items-center gap-2 px-6 py-4 text-sm font-medium border-b-2 transition-all ${
              activeSubTab === tab.id
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-200'
            }`}
          >
            <tab.icon size={16} />
            {tab.label}
          </button>
        ))}
      </div>

      <div className="pt-4">
        {activeSubTab === 'smtp' && <SMTPSettings organizationId={organizationId} />}
        {activeSubTab === 'api' && <APISettings organizationId={organizationId} />}
        {activeSubTab === 'webhooks' && <WebhookSettings organizationId={organizationId} />}
        {activeSubTab === 'logs' && <APILogs organizationId={organizationId} />}
      </div>
    </div>
  );
};
