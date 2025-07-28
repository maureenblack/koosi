import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Organization, organizationService } from '../services/organization.service';

export const Organizations = () => {
  const navigate = useNavigate();
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadOrganizations();
  }, []);

  const loadOrganizations = async () => {
    try {
      const data = await organizationService.getOrganizations();
      setOrganizations(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const getOrgTypeIcon = (type: string) => {
    switch (type) {
      case 'family':
        return '👨‍👩‍👧‍👦';
      case 'group':
        return '👥';
      case 'institution':
        return '🏛️';
      default:
        return '🏢';
    }
  };

  const getRoleLabel = (org: Organization) => {
    const membership = org.memberships[0];
    if (!membership) return '';
    return membership.role.name.charAt(0).toUpperCase() + membership.role.name.slice(1);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#1A0B4A] to-[#2D1B69] py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#1A0B4A] to-[#2D1B69] py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-white">My Organizations</h1>
          <button
            onClick={() => navigate('/organizations/new')}
            className="bg-gradient-to-r from-orange-500 to-yellow-500 text-white px-6 py-2 rounded-full font-semibold hover:from-orange-600 hover:to-yellow-600 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 focus:ring-offset-gray-900"
          >
            Create Organization
          </button>
        </div>

        {error && (
          <div className="mb-8 rounded-md bg-red-500/10 p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-300">{error}</p>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {organizations.map((org) => (
            <div
              key={org.id}
              onClick={() => navigate(`/organizations/${org.id}`)}
              className="bg-white/10 backdrop-blur-md rounded-lg p-6 hover:bg-white/20 transition-colors cursor-pointer border border-white/20"
            >
              <div className="flex items-center justify-between mb-4">
                {org.profilePicture ? (
                  <div className="w-12 h-12 rounded-lg overflow-hidden">
                    <img
                      src={org.profilePicture}
                      alt={org.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ) : (
                  <span className="text-4xl" role="img" aria-label={org.type}>
                    {getOrgTypeIcon(org.type)}
                  </span>
                )}
                <span className="px-3 py-1 rounded-full text-xs font-medium bg-orange-500/20 text-orange-300">
                  {getRoleLabel(org)}
                </span>
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">{org.name}</h3>
              {org.description && (
                <p className="text-gray-300 text-sm mb-4">{org.description}</p>
              )}
              <div className="flex items-center text-gray-400 text-sm">
                <span className="flex items-center">
                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                  {org.memberships.length} members
                </span>

              </div>
            </div>
          ))}
        </div>

        {organizations.length === 0 && !error && (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🏢</div>
            <h3 className="text-xl font-medium text-white mb-2">No Organizations Yet</h3>
            <p className="text-gray-400 mb-6">Create your first organization to get started</p>
            <button
              onClick={() => navigate('/organizations/new')}
              className="bg-gradient-to-r from-orange-500 to-yellow-500 text-white px-6 py-2 rounded-full font-semibold hover:from-orange-600 hover:to-yellow-600 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 focus:ring-offset-gray-900"
            >
              Create Organization
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
