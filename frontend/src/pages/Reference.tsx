import { Grid, Card, Text, Box, Table, TableData } from '@mantine/core'

const ciStatusValues: TableData = {
  head: [
    ['Status Code'],
    ['Description'], 
    ['Allowed in Production'],
    ['Color Code']
  ],
  
  body: [
    ['Active',              'CI is operational and in use',                             'Yes',              'Green'],
    ['Decommissioned',      'CI has been retired and removed from service',             'No',               'Gray'],
    ['EOL',                 'CI has passed vendor End-of-Life date – immediate risk',   'Risk managed',     'Red'],
    ['In Procurement',      'CI ordered but not yet received',                          'No',               'Amber'],
    ['In Deployment',       'CI received and being configured',                         'No',               'Blue'],
    ['Maintenance',         'CI temporarily offline for planned maintenance',           'Temporary',        'Yellow'],
  ],
};

const criticalityLevels: TableData = {
  head: [
    ['Criticality'],
    ['Definition'], 
    ['RTO Target'],
    ['Review Frequency']
  ],
  
  body: [
    ['Critical',            'Failure causes immediate business stoppage or security breach',    '≤ 1 hour',         'Quarterly'],
    ['High',                'Failure causes significant business impact within hours',          '≤ 4 hours',        'Semi-Annual'],
    ['Medium',              'Failure causes moderate impact, workarounds available',            '≤ 24 hours',       'Annual'],
    ['Low',                 'Failure causes minimal impact',                                    '≤ 72 hours',       'Annual'],
  ],
};

const environmentValues: TableData = {
  head: [
    ['Environment'],
    ['Description'], 
    ['Live Data Allowed'],
    ['Change Approval Required']
  ],
  
  body: [
    ['Production',            'Live business environment',                      'Yes',                  'Yes – CAB'],
    ['Staging',               'Pre-production testing – mirrors production',    'No',                   'Yes – Change Manager'],
    ['Testing / QA',          'Functional and security testing',                'No',                   'IT Manager'],
    ['Development',           'Active development environment',                 'No',                   'Team Lead'],
    ['DR / Failover',         'Disaster recovery standby environment',          'Replication only',     'Yes – CAB'],
  ],
};

const dataClassification: TableData = {
  head: [
    ['Relationship Type'],
    ['Description'], 
  ],
  
  body: [
    ['Public',            'Non-sensitive, freely shareable information',            'No',                'Yes'],
    ['Internal',          'For internal use only – not for external sharing',       'Recommended',       'No'],
    ['Confidential',      'Sensitive business or personal data',                    'Yes',               'Restricted / Approved only'],
    ['Restricted',        'Highest sensitivity – regulatory or legal data',         'Mandatory',         'Never'],
  ],
};

export default function Reference() {

    return (
    <Box p="xl">
      <Grid>
        <Grid.Col>
          <Card mb="lg" shadow="sm" radius="md" withBorder>
            <Text fw={600} mb="md" c="#1a2b4a">CI Status Values</Text>
              <Table striped highlightOnHover withTableBorder withColumnBorders data={ciStatusValues}/>
          </Card>

          <Card mb="lg" shadow="sm" radius="md" withBorder>
            <Text fw={600} mb="md" c="#1a2b4a">CI Criticality Levels</Text>
              <Table striped highlightOnHover withTableBorder withColumnBorders data={criticalityLevels}/>
          </Card>

          <Card mb="lg" shadow="sm" radius="md" withBorder>
            <Text fw={600} mb="md" c="#1a2b4a">CI Environment Values</Text>
              <Table striped highlightOnHover withTableBorder withColumnBorders data={environmentValues}/>
          </Card>

          <Card mb="lg" shadow="sm" radius="md" withBorder>
            <Text fw={600} mb="md" c="#1a2b4a">Data Classification</Text>
              <Table striped highlightOnHover withTableBorder withColumnBorders data={dataClassification}/>
          </Card>

          <Card mb="lg" shadow="sm" radius="md" withBorder>
            <Text fw={600} mb="md" c="#1a2b4a">Relationship Types</Text>
              <Table striped highlightOnHover withTableBorder withColumnBorders data={dataClassification}/>
          </Card>

        </Grid.Col>
      </Grid>  
    </Box>
  )
}





