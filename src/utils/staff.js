export const STAFF_DESIGNATIONS = [
  { title: 'Lab Technician', department: 'IT / Computer Lab' },
  { title: 'Network Technician', department: 'IT / Network' },
  { title: 'Electrician', department: 'Electrical / Maintenance' },
  { title: 'Maintenance Technician', department: 'Infrastructure' },
  { title: 'Plumber', department: 'Infrastructure' },
  { title: 'Security Officer', department: 'Administration' },
  { title: 'Administrative Assistant', department: 'Administration' },
];

const staffEmailDomain = 'spotlyn.local';

function staffEmailPrefix(value) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

export function staffEmailCandidate(title, name, attempt = 0) {
  const designationPrefix = staffEmailPrefix(title);
  if (attempt === 0) return `${designationPrefix}@${staffEmailDomain}`;

  const namePrefix = staffEmailPrefix(name);
  if (!namePrefix) return `${designationPrefix}-${attempt + 1}@${staffEmailDomain}`;

  const namedPrefix = `${designationPrefix}-${namePrefix}`;
  return `${namedPrefix}${attempt === 1 ? '' : `-${attempt}`}@${staffEmailDomain}`;
}
