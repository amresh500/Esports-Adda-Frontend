'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ConfirmDialog from '@/components/ConfirmDialog';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

const GAMES = [
  'Valorant',
  'CS2',
  'PUBG Mobile',
  'Dota 2',
  'League of Legends',
  'Free Fire',
  'Mobile Legends',
  'Apex Legends',
  'Call of Duty',
  'Rainbow Six Siege',
  'Other',
];

const SPECIALIZATIONS = [
  'Team Management',
  'Player Development',
  'Strategy & Analysis',
  'Content Creation',
  'Social Media',
  'Event Management',
  'Marketing',
  'Business Development',
  'Coaching',
  'Other',
];

const ROLES = [
  'Owner',
  'Co-Owner',
  'CEO',
  'Manager',
  'Coach',
  'Analyst',
  'Content Creator',
  'Social Media Manager',
  'Admin',
  'Staff',
];

export default function StaffProfilePage() {
  const router = useRouter();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [activeTab, setActiveTab] = useState<'profile' | 'experience' | 'skills' | 'achievements'>('profile');

  // Profile form state
  const [profileForm, setProfileForm] = useState({
    realName: '',
    bio: '',
    country: '',
    city: '',
    isNepal: false,
    dateOfBirth: '',
    contactEmail: '',
    contactPhone: '',
    socialLinks: {
      linkedin: '',
      twitter: '',
      instagram: '',
      discord: '',
      website: '',
    },
    isProfilePublic: true,
    showContactInfo: false,
  });

  // Work history modal
  const [showWorkHistoryModal, setShowWorkHistoryModal] = useState(false);
  const [workHistoryForm, setWorkHistoryForm] = useState({
    organizationName: '',
    role: '',
    department: '',
    startDate: '',
    endDate: '',
    description: '',
    isCurrent: false,
  });

  // Skills & specializations
  const [newSkill, setNewSkill] = useState('');
  const [selectedSpecializations, setSelectedSpecializations] = useState<string[]>([]);

  // Achievement modal
  const [showAchievementModal, setShowAchievementModal] = useState(false);
  const [achievementForm, setAchievementForm] = useState({
    title: '',
    description: '',
    organization: '',
    date: '',
  });

  // Certification modal
  const [showCertificationModal, setShowCertificationModal] = useState(false);

  // Confirmation modal states
  const [showRemoveConfirm, setShowRemoveConfirm] = useState(false);
  const [removeAction, setRemoveAction] = useState<{ type: 'workHistory' | 'achievement' | 'certification'; id: string } | null>(null);
  const [certificationForm, setCertificationForm] = useState({
    name: '',
    issuer: '',
    date: '',
    expiryDate: '',
    credentialId: '',
  });

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        router.push('/login');
        return;
      }

      const response = await axios.get(`${API_URL}/api/staff-profile/my`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const profileData = response.data.data.profile;
      setProfile(profileData);

      // Populate form with existing data
      setProfileForm({
        realName: profileData.realName || '',
        bio: profileData.bio || '',
        country: profileData.country || '',
        city: profileData.city || '',
        isNepal: profileData.isNepal || false,
        dateOfBirth: profileData.dateOfBirth
          ? new Date(profileData.dateOfBirth).toISOString().split('T')[0]
          : '',
        contactEmail: profileData.contactEmail || '',
        contactPhone: profileData.contactPhone || '',
        socialLinks: {
          linkedin: profileData.socialLinks?.linkedin || '',
          twitter: profileData.socialLinks?.twitter || '',
          instagram: profileData.socialLinks?.instagram || '',
          discord: profileData.socialLinks?.discord || '',
          website: profileData.socialLinks?.website || '',
        },
        isProfilePublic: profileData.isProfilePublic !== false,
        showContactInfo: profileData.showContactInfo || false,
      });

      setSelectedSpecializations(profileData.specializations || []);

      setLoading(false);
    } catch (error: any) {
      console.error('Error fetching profile:', error);
      // If no profile exists, create one
      if (error.response?.status === 404) {
        setProfile({});
        setLoading(false);
      } else {
        setError(error.response?.data?.message || 'Failed to load profile');
        setLoading(false);
      }
    }
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      await axios.put(
        `${API_URL}/api/staff-profile/my`,
        {
          ...profileForm,
          specializations: selectedSpecializations,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setSuccess('Profile updated successfully!');
      setIsEditingProfile(false);
      fetchProfile();
      setTimeout(() => setSuccess(''), 3000);
    } catch (error: any) {
      setError(error.response?.data?.message || 'Failed to update profile');
      setTimeout(() => setError(''), 3000);
    }
  };

  const handleAddWorkHistory = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      await axios.post(
        `${API_URL}/api/staff-profile/my/work-history`,
        workHistoryForm,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setSuccess('Work history added successfully!');
      setShowWorkHistoryModal(false);
      setWorkHistoryForm({
        organizationName: '',
        role: '',
        department: '',
        startDate: '',
        endDate: '',
        description: '',
        isCurrent: false,
      });
      fetchProfile();
      setTimeout(() => setSuccess(''), 3000);
    } catch (error: any) {
      setError(error.response?.data?.message || 'Failed to add work history');
      setTimeout(() => setError(''), 3000);
    }
  };

  const openRemoveConfirm = (type: 'workHistory' | 'achievement' | 'certification', id: string) => {
    setRemoveAction({ type, id });
    setShowRemoveConfirm(true);
  };

  const handleConfirmRemove = async () => {
    if (!removeAction) return;

    try {
      const token = localStorage.getItem('token');
      let url = '';
      let successMsg = '';

      if (removeAction.type === 'workHistory') {
        url = `${API_URL}/api/staff-profile/my/work-history/${removeAction.id}`;
        successMsg = 'Work history removed successfully!';
      } else if (removeAction.type === 'achievement') {
        url = `${API_URL}/api/staff-profile/my/achievements/${removeAction.id}`;
        successMsg = 'Achievement removed successfully!';
      } else if (removeAction.type === 'certification') {
        url = `${API_URL}/api/staff-profile/my/certifications/${removeAction.id}`;
        successMsg = 'Certification removed successfully!';
      }

      await axios.delete(url, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setSuccess(successMsg);
      setShowRemoveConfirm(false);
      setRemoveAction(null);
      fetchProfile();
      setTimeout(() => setSuccess(''), 3000);
    } catch (error: any) {
      setError(error.response?.data?.message || 'Failed to remove item');
      setTimeout(() => setError(''), 3000);
    }
  };

  const handleAddSkill = async () => {
    if (!newSkill.trim()) return;

    try {
      const token = localStorage.getItem('token');
      const updatedSkills = [...(profile.skills || []), newSkill.trim()];
      await axios.put(
        `${API_URL}/api/staff-profile/my`,
        { skills: updatedSkills },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setNewSkill('');
      fetchProfile();
    } catch (error: any) {
      setError(error.response?.data?.message || 'Failed to add skill');
      setTimeout(() => setError(''), 3000);
    }
  };

  const handleRemoveSkill = async (skillToRemove: string) => {
    try {
      const token = localStorage.getItem('token');
      const updatedSkills = profile.skills.filter((s: string) => s !== skillToRemove);
      await axios.put(
        `${API_URL}/api/staff-profile/my`,
        { skills: updatedSkills },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchProfile();
    } catch (error: any) {
      setError(error.response?.data?.message || 'Failed to remove skill');
      setTimeout(() => setError(''), 3000);
    }
  };

  const handleAddAchievement = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      await axios.post(
        `${API_URL}/api/staff-profile/my/achievements`,
        achievementForm,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setSuccess('Achievement added successfully!');
      setShowAchievementModal(false);
      setAchievementForm({
        title: '',
        description: '',
        organization: '',
        date: '',
      });
      fetchProfile();
      setTimeout(() => setSuccess(''), 3000);
    } catch (error: any) {
      setError(error.response?.data?.message || 'Failed to add achievement');
      setTimeout(() => setError(''), 3000);
    }
  };

  const handleRemoveAchievement = (achievementId: string) => {
    openRemoveConfirm('achievement', achievementId);
  };

  const handleAddCertification = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      await axios.post(
        `${API_URL}/api/staff-profile/my/certifications`,
        certificationForm,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setSuccess('Certification added successfully!');
      setShowCertificationModal(false);
      setCertificationForm({
        name: '',
        issuer: '',
        date: '',
        expiryDate: '',
        credentialId: '',
      });
      fetchProfile();
      setTimeout(() => setSuccess(''), 3000);
    } catch (error: any) {
      setError(error.response?.data?.message || 'Failed to add certification');
      setTimeout(() => setError(''), 3000);
    }
  };

  const handleRemoveCertification = (certificationId: string) => {
    openRemoveConfirm('certification', certificationId);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#111111] to-[#441415]">
        <Header />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-white text-xl">Loading profile...</div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#111111] to-[#441415]">
      <Header />

      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Success/Error Messages */}
        {success && (
          <div className="mb-4 bg-green-500/20 border border-green-500 text-green-300 px-6 py-4 rounded-lg">
            {success}
          </div>
        )}
        {error && (
          <div className="mb-4 bg-red-500/20 border border-red-500 text-red-300 px-6 py-4 rounded-lg">
            {error}
          </div>
        )}

        {/* Profile Header */}
        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/20 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-white mb-2">
                {profile?.realName || profile?.user?.username || 'Staff Profile'}
              </h1>
              <p className="text-gray-400">
                @{profile?.user?.username} • {profile?.currentRole || 'Staff Member'}
              </p>
              {profile?.currentOrganization && (
                <p className="text-blue-400 mt-2">
                  Currently at {profile.currentOrganization.organizationName}
                </p>
              )}
            </div>
            {profile?.profilePicture && (
              <img
                src={profile.profilePicture}
                alt="Profile"
                className="w-24 h-24 rounded-full border-4 border-white/20"
              />
            )}
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white/5 backdrop-blur-md rounded-2xl border border-white/20 mb-6">
          <div className="flex border-b border-white/10">
            <button
              onClick={() => setActiveTab('profile')}
              className={`px-8 py-4 font-semibold transition-all ${
                activeTab === 'profile'
                  ? 'text-white border-b-2 border-white'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Profile
            </button>
            <button
              onClick={() => setActiveTab('experience')}
              className={`px-8 py-4 font-semibold transition-all ${
                activeTab === 'experience'
                  ? 'text-white border-b-2 border-white'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Experience
            </button>
            <button
              onClick={() => setActiveTab('skills')}
              className={`px-8 py-4 font-semibold transition-all ${
                activeTab === 'skills'
                  ? 'text-white border-b-2 border-white'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Skills & Expertise
            </button>
            <button
              onClick={() => setActiveTab('achievements')}
              className={`px-8 py-4 font-semibold transition-all ${
                activeTab === 'achievements'
                  ? 'text-white border-b-2 border-white'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Achievements
            </button>
          </div>

          <div className="p-8">
            {/* Profile Tab - View Mode */}
            {activeTab === 'profile' && !isEditingProfile && (
              <div>
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold text-white">Staff Profile</h2>
                  <button
                    onClick={() => setIsEditingProfile(true)}
                    className="px-6 py-3 bg-white/10 border border-white/20 text-white rounded-lg hover:bg-white/20 transition-all"
                  >
                    Edit Profile
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="text-gray-400 text-sm">Real Name</label>
                    <p className="text-white text-lg">{profile?.realName || 'Not set'}</p>
                  </div>
                  <div>
                    <label className="text-gray-400 text-sm">Email</label>
                    <p className="text-white text-lg">{profile?.user?.email || 'Not set'}</p>
                  </div>
                  <div>
                    <label className="text-gray-400 text-sm">Contact Email</label>
                    <p className="text-white text-lg">{profile?.contactEmail || 'Not set'}</p>
                  </div>
                  <div>
                    <label className="text-gray-400 text-sm">Contact Phone</label>
                    <p className="text-white text-lg">{profile?.contactPhone || 'Not set'}</p>
                  </div>
                  <div>
                    <label className="text-gray-400 text-sm">Country</label>
                    <p className="text-white text-lg">{profile?.country || 'Not set'}</p>
                  </div>
                  <div>
                    <label className="text-gray-400 text-sm">City</label>
                    <p className="text-white text-lg">{profile?.city || 'Not set'}</p>
                  </div>
                  <div className="col-span-2">
                    <label className="text-gray-400 text-sm">Bio</label>
                    <p className="text-white">{profile?.bio || 'No bio yet'}</p>
                  </div>
                </div>

                {/* Social Links */}
                {profile?.socialLinks && (
                  <div className="mt-8">
                    <h3 className="text-xl font-bold text-white mb-4">Social Links</h3>
                    <div className="flex flex-wrap gap-3">
                      {profile.socialLinks.linkedin && (
                        <a
                          href={profile.socialLinks.linkedin}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-4 py-2 bg-blue-500/20 text-blue-300 rounded-lg hover:bg-blue-500/30 transition-all"
                        >
                          LinkedIn
                        </a>
                      )}
                      {profile.socialLinks.twitter && (
                        <a
                          href={profile.socialLinks.twitter}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-4 py-2 bg-sky-500/20 text-sky-300 rounded-lg hover:bg-sky-500/30 transition-all"
                        >
                          Twitter
                        </a>
                      )}
                      {profile.socialLinks.website && (
                        <a
                          href={profile.socialLinks.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-4 py-2 bg-purple-500/20 text-purple-300 rounded-lg hover:bg-purple-500/30 transition-all"
                        >
                          Website
                        </a>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Profile Tab - Edit Mode */}
            {activeTab === 'profile' && isEditingProfile && (
              <form onSubmit={handleUpdateProfile} className="space-y-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold text-white">Edit Profile</h2>
                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={() => {
                        setIsEditingProfile(false);
                        fetchProfile(); // Reset form
                      }}
                      className="px-6 py-3 bg-white/10 border border-white/20 text-white rounded-lg hover:bg-white/20 transition-all"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-6 py-3 bg-green-500/20 border border-green-500 text-green-300 rounded-lg hover:bg-green-500/30 transition-all font-semibold"
                    >
                      Save Changes
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-white mb-2">Real Name</label>
                    <input
                      type="text"
                      value={profileForm.realName}
                      onChange={(e) => setProfileForm({ ...profileForm, realName: e.target.value })}
                      className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-white/40"
                      placeholder="Your real name"
                    />
                  </div>
                  <div>
                    <label className="block text-white mb-2">Contact Email</label>
                    <input
                      type="email"
                      value={profileForm.contactEmail}
                      onChange={(e) => setProfileForm({ ...profileForm, contactEmail: e.target.value })}
                      className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-white/40"
                      placeholder="contact@email.com"
                    />
                  </div>
                  <div>
                    <label className="block text-white mb-2">Contact Phone</label>
                    <input
                      type="tel"
                      value={profileForm.contactPhone}
                      onChange={(e) => setProfileForm({ ...profileForm, contactPhone: e.target.value })}
                      className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-white/40"
                      placeholder="+1234567890"
                    />
                  </div>
                  <div>
                    <label className="block text-white mb-2">Country</label>
                    <input
                      type="text"
                      value={profileForm.country}
                      onChange={(e) => setProfileForm({ ...profileForm, country: e.target.value })}
                      className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-white/40"
                      placeholder="Your country"
                    />
                  </div>
                  <div>
                    <label className="block text-white mb-2">City</label>
                    <input
                      type="text"
                      value={profileForm.city}
                      onChange={(e) => setProfileForm({ ...profileForm, city: e.target.value })}
                      className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-white/40"
                      placeholder="Your city"
                    />
                  </div>
                  <div>
                    <label className="block text-white mb-2">Date of Birth</label>
                    <input
                      type="date"
                      value={profileForm.dateOfBirth}
                      onChange={(e) => setProfileForm({ ...profileForm, dateOfBirth: e.target.value })}
                      className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-white/40"
                    />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-white mb-2">Bio</label>
                    <textarea
                      value={profileForm.bio}
                      onChange={(e) => setProfileForm({ ...profileForm, bio: e.target.value })}
                      className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-white/40 h-32 resize-none"
                      placeholder="Tell us about yourself..."
                      maxLength={1000}
                    />
                  </div>
                </div>

                {/* Social Links */}
                <div>
                  <h3 className="text-xl font-bold text-white mb-4">Social Links</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <input
                      type="url"
                      placeholder="LinkedIn URL"
                      value={profileForm.socialLinks.linkedin}
                      onChange={(e) =>
                        setProfileForm({
                          ...profileForm,
                          socialLinks: { ...profileForm.socialLinks, linkedin: e.target.value },
                        })
                      }
                      className="px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-white/40"
                    />
                    <input
                      type="url"
                      placeholder="Twitter URL"
                      value={profileForm.socialLinks.twitter}
                      onChange={(e) =>
                        setProfileForm({
                          ...profileForm,
                          socialLinks: { ...profileForm.socialLinks, twitter: e.target.value },
                        })
                      }
                      className="px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-white/40"
                    />
                    <input
                      type="url"
                      placeholder="Website URL"
                      value={profileForm.socialLinks.website}
                      onChange={(e) =>
                        setProfileForm({
                          ...profileForm,
                          socialLinks: { ...profileForm.socialLinks, website: e.target.value },
                        })
                      }
                      className="px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-white/40"
                    />
                  </div>
                </div>

                {/* Privacy Settings */}
                <div className="space-y-4">
                  <h3 className="text-xl font-bold text-white">Privacy Settings</h3>
                  <label className="flex items-center gap-3 text-white">
                    <input
                      type="checkbox"
                      checked={profileForm.isProfilePublic}
                      onChange={(e) => setProfileForm({ ...profileForm, isProfilePublic: e.target.checked })}
                      className="w-5 h-5"
                    />
                    Make profile public
                  </label>
                  <label className="flex items-center gap-3 text-white">
                    <input
                      type="checkbox"
                      checked={profileForm.showContactInfo}
                      onChange={(e) => setProfileForm({ ...profileForm, showContactInfo: e.target.checked })}
                      className="w-5 h-5"
                    />
                    Show contact information publicly
                  </label>
                </div>
              </form>
            )}

            {/* Experience Tab */}
            {activeTab === 'experience' && (
              <div>
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold text-white">Work History</h2>
                  <button
                    onClick={() => setShowWorkHistoryModal(true)}
                    className="px-6 py-3 bg-green-500/20 border border-green-500 text-green-300 rounded-lg hover:bg-green-500/30 transition-all font-semibold"
                  >
                    + Add Experience
                  </button>
                </div>

                {profile?.workHistory && profile.workHistory.length > 0 ? (
                  <div className="space-y-4">
                    {profile.workHistory.map((work: any, index: number) => (
                      <div
                        key={index}
                        className="bg-white/5 p-6 rounded-lg border border-white/10 hover:border-white/20 transition-all"
                      >
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <h3 className="text-xl font-bold text-white">{work.role}</h3>
                            <p className="text-blue-400">{work.organizationName}</p>
                            {work.department && (
                              <p className="text-gray-400 text-sm">{work.department}</p>
                            )}
                          </div>
                          <button
                            onClick={() => openRemoveConfirm('workHistory', work._id)}
                            className="text-red-400 hover:text-red-300 transition-colors"
                          >
                            Remove
                          </button>
                        </div>
                        <p className="text-gray-400 text-sm mb-2">
                          {new Date(work.startDate).toLocaleDateString()} -{' '}
                          {work.isCurrent ? 'Present' : new Date(work.endDate).toLocaleDateString()}
                        </p>
                        {work.description && <p className="text-white">{work.description}</p>}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <p className="text-gray-400 mb-2">No work history added yet</p>
                    <p className="text-gray-500 text-sm">Add your professional experience to showcase your career</p>
                  </div>
                )}
              </div>
            )}

            {/* Skills Tab */}
            {activeTab === 'skills' && (
              <div>
                <h2 className="text-2xl font-bold text-white mb-6">Skills & Expertise</h2>

                {/* Skills Section */}
                <div className="mb-8">
                  <h3 className="text-xl font-semibold text-white mb-4">Skills</h3>
                  <div className="flex gap-2 mb-4">
                    <input
                      type="text"
                      value={newSkill}
                      onChange={(e) => setNewSkill(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleAddSkill()}
                      placeholder="Add a skill"
                      className="flex-1 px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-white/40"
                    />
                    <button
                      onClick={handleAddSkill}
                      className="px-6 py-3 bg-green-500/20 border border-green-500 text-green-300 rounded-lg hover:bg-green-500/30 transition-all"
                    >
                      Add
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {profile?.skills && profile.skills.length > 0 ? (
                      profile.skills.map((skill: string, index: number) => (
                        <div
                          key={index}
                          className="px-4 py-2 bg-blue-500/20 text-blue-300 rounded-full flex items-center gap-2"
                        >
                          {skill}
                          <button
                            onClick={() => handleRemoveSkill(skill)}
                            className="text-blue-300 hover:text-blue-100"
                          >
                            ×
                          </button>
                        </div>
                      ))
                    ) : (
                      <p className="text-gray-400">No skills added yet</p>
                    )}
                  </div>
                </div>

                {/* Specializations Section */}
                <div>
                  <h3 className="text-xl font-semibold text-white mb-4">Specializations</h3>
                  <div className="flex flex-wrap gap-2">
                    {SPECIALIZATIONS.map((spec) => (
                      <button
                        key={spec}
                        onClick={() => {
                          const newSpecs = selectedSpecializations.includes(spec)
                            ? selectedSpecializations.filter((s) => s !== spec)
                            : [...selectedSpecializations, spec];
                          setSelectedSpecializations(newSpecs);
                          // Update profile
                          const token = localStorage.getItem('token');
                          axios.put(
                            `${API_URL}/api/staff-profile/my`,
                            { specializations: newSpecs },
                            { headers: { Authorization: `Bearer ${token}` } }
                          ).then(() => fetchProfile());
                        }}
                        className={`px-4 py-2 rounded-full transition-all ${
                          selectedSpecializations.includes(spec)
                            ? 'bg-purple-500/30 text-purple-200 border-2 border-purple-400'
                            : 'bg-white/10 text-gray-300 border border-white/20 hover:bg-white/20'
                        }`}
                      >
                        {spec}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Achievements Tab */}
            {activeTab === 'achievements' && (
              <div>
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold text-white">Achievements & Certifications</h2>
                  <div className="flex gap-3">
                    <button
                      onClick={() => setShowAchievementModal(true)}
                      className="px-6 py-3 bg-green-500/20 border border-green-500 text-green-300 rounded-lg hover:bg-green-500/30 transition-all font-semibold"
                    >
                      + Add Achievement
                    </button>
                    <button
                      onClick={() => setShowCertificationModal(true)}
                      className="px-6 py-3 bg-blue-500/20 border border-blue-500 text-blue-300 rounded-lg hover:bg-blue-500/30 transition-all font-semibold"
                    >
                      + Add Certification
                    </button>
                  </div>
                </div>

                {/* Achievements */}
                <div className="mb-8">
                  <h3 className="text-xl font-semibold text-white mb-4">Achievements</h3>
                  {profile?.achievements && profile.achievements.length > 0 ? (
                    <div className="space-y-3">
                      {profile.achievements.map((achievement: any, index: number) => (
                        <div
                          key={index}
                          className="bg-white/5 p-4 rounded-lg border border-white/10 flex justify-between items-start"
                        >
                          <div>
                            <h4 className="text-white font-semibold">{achievement.title}</h4>
                            {achievement.organization && (
                              <p className="text-blue-400 text-sm">{achievement.organization}</p>
                            )}
                            {achievement.description && (
                              <p className="text-gray-400 text-sm mt-1">{achievement.description}</p>
                            )}
                            {achievement.date && (
                              <p className="text-gray-500 text-sm mt-1">
                                {new Date(achievement.date).toLocaleDateString()}
                              </p>
                            )}
                          </div>
                          <button
                            onClick={() => handleRemoveAchievement(achievement._id)}
                            className="text-red-400 hover:text-red-300"
                          >
                            Remove
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-400">No achievements added yet</p>
                  )}
                </div>

                {/* Certifications */}
                <div>
                  <h3 className="text-xl font-semibold text-white mb-4">Certifications</h3>
                  {profile?.certifications && profile.certifications.length > 0 ? (
                    <div className="space-y-3">
                      {profile.certifications.map((cert: any, index: number) => (
                        <div
                          key={index}
                          className="bg-white/5 p-4 rounded-lg border border-white/10 flex justify-between items-start"
                        >
                          <div>
                            <h4 className="text-white font-semibold">{cert.name}</h4>
                            {cert.issuer && <p className="text-blue-400 text-sm">{cert.issuer}</p>}
                            {cert.credentialId && (
                              <p className="text-gray-400 text-sm">Credential ID: {cert.credentialId}</p>
                            )}
                            <p className="text-gray-500 text-sm mt-1">
                              {cert.date && new Date(cert.date).toLocaleDateString()}
                              {cert.expiryDate && ` - ${new Date(cert.expiryDate).toLocaleDateString()}`}
                            </p>
                          </div>
                          <button
                            onClick={() => handleRemoveCertification(cert._id)}
                            className="text-red-400 hover:text-red-300"
                          >
                            Remove
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-400">No certifications added yet</p>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Work History Modal */}
      {showWorkHistoryModal && (
        <div
          className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={() => setShowWorkHistoryModal(false)}
        >
          <div
            className="bg-gradient-to-b from-[#1a1a1a] to-[#2a1a1a] rounded-2xl p-8 max-w-md w-full border border-white/20"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-2xl font-bold text-white mb-6">Add Work Experience</h2>
            <form onSubmit={handleAddWorkHistory} className="space-y-4">
              <div>
                <label className="block text-white mb-2">Organization Name *</label>
                <input
                  type="text"
                  value={workHistoryForm.organizationName}
                  onChange={(e) => setWorkHistoryForm({ ...workHistoryForm, organizationName: e.target.value })}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-white/40"
                  required
                />
              </div>
              <div>
                <label className="block text-white mb-2">Role *</label>
                <input
                  type="text"
                  value={workHistoryForm.role}
                  onChange={(e) => setWorkHistoryForm({ ...workHistoryForm, role: e.target.value })}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-white/40"
                  required
                />
              </div>
              <div>
                <label className="block text-white mb-2">Department</label>
                <input
                  type="text"
                  value={workHistoryForm.department}
                  onChange={(e) => setWorkHistoryForm({ ...workHistoryForm, department: e.target.value })}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-white/40"
                />
              </div>
              <div>
                <label className="block text-white mb-2">Start Date *</label>
                <input
                  type="date"
                  value={workHistoryForm.startDate}
                  onChange={(e) => setWorkHistoryForm({ ...workHistoryForm, startDate: e.target.value })}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-white/40"
                  required
                />
              </div>
              <div>
                <label className="block text-white mb-2">End Date</label>
                <input
                  type="date"
                  value={workHistoryForm.endDate}
                  onChange={(e) => setWorkHistoryForm({ ...workHistoryForm, endDate: e.target.value })}
                  disabled={workHistoryForm.isCurrent}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-white/40 disabled:opacity-50"
                />
              </div>
              <label className="flex items-center gap-3 text-white">
                <input
                  type="checkbox"
                  checked={workHistoryForm.isCurrent}
                  onChange={(e) => setWorkHistoryForm({ ...workHistoryForm, isCurrent: e.target.checked })}
                  className="w-5 h-5"
                />
                I currently work here
              </label>
              <div>
                <label className="block text-white mb-2">Description</label>
                <textarea
                  value={workHistoryForm.description}
                  onChange={(e) => setWorkHistoryForm({ ...workHistoryForm, description: e.target.value })}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-white/40 h-24 resize-none"
                  maxLength={500}
                />
              </div>
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowWorkHistoryModal(false)}
                  className="flex-1 px-4 py-3 bg-white/10 border border-white/20 text-white rounded-lg hover:bg-white/20 transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-3 bg-green-500/20 border border-green-500 text-green-300 rounded-lg hover:bg-green-500/30 transition-all font-semibold"
                >
                  Add Experience
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Achievement Modal */}
      {showAchievementModal && (
        <div
          className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={() => setShowAchievementModal(false)}
        >
          <div
            className="bg-gradient-to-b from-[#1a1a1a] to-[#2a1a1a] rounded-2xl p-8 max-w-md w-full border border-white/20"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-2xl font-bold text-white mb-6">Add Achievement</h2>
            <form onSubmit={handleAddAchievement} className="space-y-4">
              <div>
                <label className="block text-white mb-2">Title *</label>
                <input
                  type="text"
                  value={achievementForm.title}
                  onChange={(e) => setAchievementForm({ ...achievementForm, title: e.target.value })}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-white/40"
                  required
                />
              </div>
              <div>
                <label className="block text-white mb-2">Organization</label>
                <input
                  type="text"
                  value={achievementForm.organization}
                  onChange={(e) => setAchievementForm({ ...achievementForm, organization: e.target.value })}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-white/40"
                />
              </div>
              <div>
                <label className="block text-white mb-2">Date</label>
                <input
                  type="date"
                  value={achievementForm.date}
                  onChange={(e) => setAchievementForm({ ...achievementForm, date: e.target.value })}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-white/40"
                />
              </div>
              <div>
                <label className="block text-white mb-2">Description</label>
                <textarea
                  value={achievementForm.description}
                  onChange={(e) => setAchievementForm({ ...achievementForm, description: e.target.value })}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-white/40 h-24 resize-none"
                />
              </div>
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowAchievementModal(false)}
                  className="flex-1 px-4 py-3 bg-white/10 border border-white/20 text-white rounded-lg hover:bg-white/20 transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-3 bg-green-500/20 border border-green-500 text-green-300 rounded-lg hover:bg-green-500/30 transition-all font-semibold"
                >
                  Add Achievement
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Certification Modal */}
      {showCertificationModal && (
        <div
          className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={() => setShowCertificationModal(false)}
        >
          <div
            className="bg-gradient-to-b from-[#1a1a1a] to-[#2a1a1a] rounded-2xl p-8 max-w-md w-full border border-white/20"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-2xl font-bold text-white mb-6">Add Certification</h2>
            <form onSubmit={handleAddCertification} className="space-y-4">
              <div>
                <label className="block text-white mb-2">Certification Name *</label>
                <input
                  type="text"
                  value={certificationForm.name}
                  onChange={(e) => setCertificationForm({ ...certificationForm, name: e.target.value })}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-white/40"
                  required
                />
              </div>
              <div>
                <label className="block text-white mb-2">Issuer</label>
                <input
                  type="text"
                  value={certificationForm.issuer}
                  onChange={(e) => setCertificationForm({ ...certificationForm, issuer: e.target.value })}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-white/40"
                />
              </div>
              <div>
                <label className="block text-white mb-2">Issue Date</label>
                <input
                  type="date"
                  value={certificationForm.date}
                  onChange={(e) => setCertificationForm({ ...certificationForm, date: e.target.value })}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-white/40"
                />
              </div>
              <div>
                <label className="block text-white mb-2">Expiry Date</label>
                <input
                  type="date"
                  value={certificationForm.expiryDate}
                  onChange={(e) => setCertificationForm({ ...certificationForm, expiryDate: e.target.value })}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-white/40"
                />
              </div>
              <div>
                <label className="block text-white mb-2">Credential ID</label>
                <input
                  type="text"
                  value={certificationForm.credentialId}
                  onChange={(e) => setCertificationForm({ ...certificationForm, credentialId: e.target.value })}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-white/40"
                />
              </div>
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowCertificationModal(false)}
                  className="flex-1 px-4 py-3 bg-white/10 border border-white/20 text-white rounded-lg hover:bg-white/20 transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-3 bg-blue-500/20 border border-blue-500 text-blue-300 rounded-lg hover:bg-blue-500/30 transition-all font-semibold"
                >
                  Add Certification
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Remove Confirmation Modal */}
      {showRemoveConfirm && removeAction && (
        <ConfirmDialog
          title={
            removeAction.type === 'workHistory'
              ? 'Remove Work History?'
              : removeAction.type === 'achievement'
              ? 'Remove Achievement?'
              : 'Remove Certification?'
          }
          message={
            removeAction.type === 'workHistory'
              ? 'Are you sure you want to remove this work history entry? This action cannot be undone.'
              : removeAction.type === 'achievement'
              ? 'Are you sure you want to remove this achievement? This action cannot be undone.'
              : 'Are you sure you want to remove this certification? This action cannot be undone.'
          }
          confirmText="Yes, Remove"
          cancelText="Cancel"
          confirmButtonClass="bg-red-500 hover:bg-red-600"
          onConfirm={handleConfirmRemove}
          onCancel={() => {
            setShowRemoveConfirm(false);
            setRemoveAction(null);
          }}
        />
      )}

      <Footer />
    </div>
  );
}
