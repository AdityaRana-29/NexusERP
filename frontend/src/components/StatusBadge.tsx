import React from 'react';
import { CustomerStatus, CustomerType, ChallanStatus, MovementType } from '../types';

interface StatusBadgeProps {
  status: CustomerStatus | CustomerType | ChallanStatus | MovementType | string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
  const getBadgeClass = (val: string) => {
    switch (val) {
      case 'Active':
      case 'Confirmed':
      case 'IN':
      case 'Distributor':
        return 'badge-success';
      case 'Lead':
      case 'Draft':
      case 'Wholesale':
        return 'badge-warning';
      case 'Inactive':
      case 'Cancelled':
      case 'OUT':
        return 'badge-danger';
      case 'Retail':
        return 'badge-primary';
      default:
        return 'badge-secondary';
    }
  };

  return <span className={`badge ${getBadgeClass(status)}`}>{status}</span>;
};
