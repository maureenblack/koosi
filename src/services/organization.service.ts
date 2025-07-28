import { AuthService } from './auth.service';

export interface Organization {
  id: string;
  name: string;
  type: 'root' | 'family' | 'group' | 'institution';
  description?: string;
  profilePicture?: string;
  parentOrgId?: string;
  memberships: Membership[];
  createdAt: string;
  updatedAt: string;
}

export interface Membership {
  id: string;
  userId: string;
  organizationId: string;
  role: Role;
  status: 'active' | 'inactive' | 'suspended';
}

export interface Role {
  id: string;
  name: string;
  permissions: {
    manageOrganization?: boolean;
    manageMembers?: boolean;
    manageRoles?: boolean;
    manageCapsules?: boolean;
    manageVerifications?: boolean;
    createCapsules?: boolean;
    viewCapsules?: boolean;
    viewMembers?: boolean;
    verifyOrganization?: boolean;
  };
}

export interface CreateOrganizationData {
  name: string;
  type: 'family' | 'group' | 'institution';
  description?: string;
  profilePicture?: File;
  parentOrgId?: string;
}

export interface InviteMemberData {
  email: string;
  roleId: string;
}

class OrganizationService {
  private baseUrl = `${process.env.REACT_APP_API_URL || 'http://localhost:3001'}/api/organizations`;

  async createOrganization(data: CreateOrganizationData): Promise<Organization> {
    const formData = new FormData();
    formData.append('name', data.name);
    formData.append('type', data.type);
    if (data.description) formData.append('description', data.description);
    if (data.parentOrgId) formData.append('parentOrgId', data.parentOrgId);
    if (data.profilePicture) formData.append('profilePicture', data.profilePicture);

    const response = await fetch(this.baseUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${AuthService.getToken()}`,
      },
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to create organization');
    }

    return response.json();
  }

  async getOrganizations(): Promise<Organization[]> {
    const response = await fetch(this.baseUrl, {
      headers: {
        'Authorization': `Bearer ${AuthService.getToken()}`,
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to fetch organizations');
    }

    return response.json();
  }

  async inviteMember(organizationId: string, data: InviteMemberData): Promise<any> {
    const response = await fetch(`${this.baseUrl}/${organizationId}/invite`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${AuthService.getToken()}`,
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to invite member');
    }

    return response.json();
  }

  async acceptInvitation(token: string): Promise<Membership> {
    const response = await fetch(`${this.baseUrl}/invitations/${token}/accept`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${AuthService.getToken()}`,
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to accept invitation');
    }

    return response.json();
  }

  async submitVerification(organizationId: string, type: string, data: any): Promise<any> {
    const response = await fetch(`${this.baseUrl}/${organizationId}/verify`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${AuthService.getToken()}`,
      },
      body: JSON.stringify({ type, data }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to submit verification');
    }

    return response.json();
  }
}

export const organizationService = new OrganizationService();
