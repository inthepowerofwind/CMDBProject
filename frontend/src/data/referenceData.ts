import { ReferenceTable } from '../api/referenceService'

export const referenceTables: ReferenceTable[] = [
  {
    id: 'ci_status',
    title: 'CI Status Values',
    columns: ['Status Code', 'Description', 'Allowed in Production', 'Color Code'],
    rows: [
      { id: '1', 'Status Code': 'Active',         'Description': 'CI is operational and in use',                           'Allowed in Production': 'Yes',            'Color Code': 'Green' },
      { id: '2', 'Status Code': 'Decommissioned',  'Description': 'CI has been retired and removed from service',           'Allowed in Production': 'No',             'Color Code': 'Gray'  },
      { id: '3', 'Status Code': 'EOL',             'Description': 'CI has passed vendor End-of-Life date – immediate risk', 'Allowed in Production': 'Risk managed',   'Color Code': 'Red'   },
      { id: '4', 'Status Code': 'In Procurement',  'Description': 'CI ordered but not yet received',                       'Allowed in Production': 'No',             'Color Code': 'Amber' },
      { id: '5', 'Status Code': 'In Deployment',   'Description': 'CI received and being configured',                      'Allowed in Production': 'No',             'Color Code': 'Blue'  },
      { id: '6', 'Status Code': 'Maintenance',     'Description': 'CI temporarily offline for planned maintenance',        'Allowed in Production': 'Temporary',      'Color Code': 'Yellow'},
    ],
  },
  {
    id: 'criticality',
    title: 'CI Criticality Levels',
    columns: ['Criticality', 'Definition', 'RTO Target', 'Review Frequency'],
    rows: [
      { id: '1', 'Criticality': 'Critical', 'Definition': 'Failure causes immediate business stoppage or security breach', 'RTO Target': '≤ 1 hour',   'Review Frequency': 'Quarterly'   },
      { id: '2', 'Criticality': 'High',     'Definition': 'Failure causes significant business impact within hours',      'RTO Target': '≤ 4 hours',  'Review Frequency': 'Semi-Annual' },
      { id: '3', 'Criticality': 'Medium',   'Definition': 'Failure causes moderate impact, workarounds available',        'RTO Target': '≤ 24 hours', 'Review Frequency': 'Annual'      },
      { id: '4', 'Criticality': 'Low',      'Definition': 'Failure causes minimal impact',                                'RTO Target': '≤ 72 hours', 'Review Frequency': 'Annual'      },
    ],
  },
  {
    id: 'environment',
    title: 'CI Environment Values',
    columns: ['Environment', 'Description', 'Live Data Allowed', 'Change Approval Required'],
    rows: [
      { id: '1', 'Environment': 'Production',    'Description': 'Live business environment',                     'Live Data Allowed': 'Yes',                'Change Approval Required': 'Yes – CAB'              },
      { id: '2', 'Environment': 'Staging',       'Description': 'Pre-production testing – mirrors production',   'Live Data Allowed': 'No',                 'Change Approval Required': 'Yes – Change Manager'   },
      { id: '3', 'Environment': 'Testing / QA',  'Description': 'Functional and security testing',               'Live Data Allowed': 'No',                 'Change Approval Required': 'IT Manager'             },
      { id: '4', 'Environment': 'Development',   'Description': 'Active development environment',                'Live Data Allowed': 'No',                 'Change Approval Required': 'Team Lead'              },
      { id: '5', 'Environment': 'DR / Failover', 'Description': 'Disaster recovery standby environment',         'Live Data Allowed': 'Replication only',   'Change Approval Required': 'Yes – CAB'              },
    ],
  },
  {
    id: 'classification',
    title: 'Data Classification',
    columns: ['Classification', 'Description', 'Encryption Required', 'External Sharing'],
    rows: [
      { id: '1', 'Classification': 'Public',       'Description': 'Non-sensitive, freely shareable information',       'Encryption Required': 'No',          'External Sharing': 'Yes'                    },
      { id: '2', 'Classification': 'Internal',     'Description': 'For internal use only – not for external sharing',  'Encryption Required': 'Recommended', 'External Sharing': 'No'                     },
      { id: '3', 'Classification': 'Confidential', 'Description': 'Sensitive business or personal data',               'Encryption Required': 'Yes',         'External Sharing': 'Restricted / Approved only' },
      { id: '4', 'Classification': 'Restricted',   'Description': 'Highest sensitivity – regulatory or legal data',    'Encryption Required': 'Mandatory',   'External Sharing': 'Never'                  },
    ],
  },
  {
    id: 'relationship',
    title: 'Relationship Types',
    columns: ['Relationship Type', 'Description'],
    rows: [
      { id: '1', 'Relationship Type': 'Runs On / Hosted By',  'Description': 'Software or service that runs on a hardware CI'       },
      { id: '2', 'Relationship Type': 'Uses / Depends On',    'Description': 'CI that requires another CI to function'              },
      { id: '3', 'Relationship Type': 'Hosts / Virtualizes',  'Description': 'Physical CI that hosts virtual CIs'                   },
      { id: '4', 'Relationship Type': 'Backed Up By',         'Description': 'CI whose data is backed up to another CI'             },
      { id: '5', 'Relationship Type': 'Replicates To',        'Description': 'CI that replicates data to another CI'                },
      { id: '6', 'Relationship Type': 'HA Pair',              'Description': 'Two CIs configured in High Availability mode'         },
      { id: '7', 'Relationship Type': 'Protects / Fronts',    'Description': 'Security CI protecting another CI'                    },
      { id: '8', 'Relationship Type': 'Load Balances',        'Description': 'CI distributing traffic to multiple target CIs'       },
      { id: '9', 'Relationship Type': 'Contains PII For',     'Description': 'CI that stores or processes data for another system'  },
    ],
  },
]