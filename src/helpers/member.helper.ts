import { fieldMapping } from './field-mapping.helper';

export const transformMembers = (members: any[]): Member[] => {
  if (members.length <= 0) {
    return [];
  }
  return members.map((member) => ({
    id: member.id,
    username: member.username,
    password: member.username,
    fullname: member.fullname,
    role: member.role,
    email: member.email,
    phone: member.phone,
    dateOfBirth: member[fieldMapping.dateOfBirth],
    telegram: member.telegram,
    level: member.level,
    createDate: member[fieldMapping.createDate]
  }));
};
