'use client';

import { useState, useEffect } from 'react';
import api from '@/lib/api';
import { useRouter } from 'next/navigation';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ConfirmDialog from '@/components/ConfirmDialog';
import SaveButton from '@/components/SaveButton';
import ToastContainer from '@/components/ToastContainer';
import { useToast } from '@/hooks/useToast';


const SPECIALIZATIONS = [
  'Team Management', 'Player Development', 'Strategy & Analysis', 'Content Creation',
  'Social Media', 'Event Management', 'Marketing', 'Business Development', 'Coaching', 'Other',
];

const fieldCls = 'w-full px-3.5 py-3 bg-white/[0.05] border border-white/[0.10] rounded-lg text-white text-sm placeholder-white/25 focus:outline-none focus:border-[#e85d5d]/50 focus:bg-white/[0.07] transition-all duration-200';
const labelCls = 'block text-white/40 text-[11px] font-semibold uppercase tracking-widest mb-1.5';

export default function StaffProfilePage() {
  const router = useRouter();
  const { toasts, removeToast, showSuccess, showError } = useToast();

  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [activeTab, setActiveTab] = useState<'profile' | 'experience' | 'skills' | 'achievements'>('profile');
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingWorkHistory, setSavingWorkHistory] = useState(false);
  const [savingAchievement, setSavingAchievement] = useState(false);
  const [savingCertification, setSavingCertification] = useState(false);

  const [profileForm, setProfileForm] = useState({
    realName: '', bio: '', country: '', city: '', isNepal: false, dateOfBirth: '',
    contactEmail: '', contactPhone: '',
    socialLinks: { linkedin: '', twitter: '', instagram: '', discord: '', website: '' },
    isProfilePublic: true, showContactInfo: false,
  });

  const [showWorkHistoryModal, setShowWorkHistoryModal] = useState(false);
  const [workHistoryForm, setWorkHistoryForm] = useState({
    organizationName: '', role: '', department: '', startDate: '', endDate: '', description: '', isCurrent: false,
  });

  const [newSkill, setNewSkill] = useState('');
  const [selectedSpecializations, setSelectedSpecializations] = useState<string[]>([]);

  const [showAchievementModal, setShowAchievementModal] = useState(false);
  const [achievementForm, setAchievementForm] = useState({ title: '', description: '', organization: '', date: '' });

  const [showCertificationModal, setShowCertificationModal] = useState(false);
  const [certificationForm, setCertificationForm] = useState({ name: '', issuer: '', date: '', expiryDate: '', credentialId: '' });

  const [showRemoveConfirm, setShowRemoveConfirm] = useState(false);
  const [removeAction, setRemoveAction] = useState<{ type: 'workHistory' | 'achievement' | 'certification'; id: string } | null>(null);

  useEffect(() => { fetchProfile(); }, []);

  const fetchProfile = async () => {
    try {
      const response = await api.get(`/staff-profile/my`);
      const p = response.data.data.profile;
      setProfile(p);
      setProfileForm({
        realName: p.realName || '', bio: p.bio || '', country: p.country || '',
        city: p.city || '', isNepal: p.isNepal || false,
        dateOfBirth: p.dateOfBirth ? new Date(p.dateOfBirth).toISOString().split('T')[0] : '',
        contactEmail: p.contactEmail || '', contactPhone: p.contactPhone || '',
        socialLinks: { linkedin: p.socialLinks?.linkedin || '', twitter: p.socialLinks?.twitter || '',
          instagram: p.socialLinks?.instagram || '', discord: p.socialLinks?.discord || '', website: p.socialLinks?.website || '' },
        isProfilePublic: p.isProfilePublic !== false, showContactInfo: p.showContactInfo || false,
      });
      setSelectedSpecializations(p.specializations || []);
      setLoading(false);
    } catch (error: any) {
      if (error.response?.status === 404) { setProfile({}); setLoading(false); }
      else { showError(error.response?.data?.message || 'Failed to load profile'); setLoading(false); }
    }
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingProfile(true);
    try {
      await api.put(`/staff-profile/my`, { ...profileForm, specializations: selectedSpecializations });
      showSuccess('Profile updated!');
      setIsEditingProfile(false);
      fetchProfile();
    } catch (error: any) {
      showError(error.response?.data?.message || 'Failed to update profile');
    } finally { setSavingProfile(false); }
  };

  const handleAddWorkHistory = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingWorkHistory(true);
    try {
      await api.post(`/staff-profile/my/work-history`, workHistoryForm);
      showSuccess('Work history added!');
      setShowWorkHistoryModal(false);
      setWorkHistoryForm({ organizationName: '', role: '', department: '', startDate: '', endDate: '', description: '', isCurrent: false });
      fetchProfile();
    } catch (error: any) {
      showError(error.response?.data?.message || 'Failed to add work history');
    } finally { setSavingWorkHistory(false); }
  };

  const openRemoveConfirm = (type: 'workHistory' | 'achievement' | 'certification', id: string) => {
    setRemoveAction({ type, id });
    setShowRemoveConfirm(true);
  };

  const handleConfirmRemove = async () => {
    if (!removeAction) return;
    try {
      const paths: Record<string, string> = {
        workHistory:   `/staff-profile/my/work-history/${removeAction.id}`,
        achievement:   `/staff-profile/my/achievements/${removeAction.id}`,
        certification: `/staff-profile/my/certifications/${removeAction.id}`,
      };
      const msgs: Record<string, string> = { workHistory: 'Work history removed!', achievement: 'Achievement removed!', certification: 'Certification removed!' };
      await api.delete(paths[removeAction.type]);
      showSuccess(msgs[removeAction.type]);
      setShowRemoveConfirm(false);
      setRemoveAction(null);
      fetchProfile();
    } catch (error: any) {
      showError(error.response?.data?.message || 'Failed to remove item');
    }
  };

  const handleAddSkill = async () => {
    if (!newSkill.trim()) return;
    try {
      await api.put(`/staff-profile/my`, { skills: [...(profile.skills || []), newSkill.trim()] });
      setNewSkill('');
      fetchProfile();
    } catch (error: any) {
      showError(error.response?.data?.message || 'Failed to add skill');
    }
  };

  const handleRemoveSkill = async (skillToRemove: string) => {
    try {
      await api.put(`/staff-profile/my`,
        { skills: profile.skills.filter((s: string) => s !== skillToRemove) });
      fetchProfile();
    } catch (error: any) {
      showError(error.response?.data?.message || 'Failed to remove skill');
    }
  };

  const handleAddAchievement = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingAchievement(true);
    try {
      await api.post(`/staff-profile/my/achievements`, achievementForm);
      showSuccess('Achievement added!');
      setShowAchievementModal(false);
      setAchievementForm({ title: '', description: '', organization: '', date: '' });
      fetchProfile();
    } catch (error: any) {
      showError(error.response?.data?.message || 'Failed to add achievement');
    } finally { setSavingAchievement(false); }
  };

  const handleAddCertification = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingCertification(true);
    try {
      await api.post(`/staff-profile/my/certifications`, certificationForm);
      showSuccess('Certification added!');
      setShowCertificationModal(false);
      setCertificationForm({ name: '', issuer: '', date: '', expiryDate: '', credentialId: '' });
      fetchProfile();
    } catch (error: any) {
      showError(error.response?.data?.message || 'Failed to add certification');
    } finally { setSavingCertification(false); }
  };

  const toggleSpecialization = async (spec: string) => {
    const newSpecs = selectedSpecializations.includes(spec)
      ? selectedSpecializations.filter((s) => s !== spec)
      : [...selectedSpecializations, spec];
    setSelectedSpecializations(newSpecs);
    try {
      await api.put(`/staff-profile/my`, { specializations: newSpecs });
      fetchProfile();
    } catch (error: any) {
      showError(error.response?.data?.message || 'Failed to update specializations');
    }
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: 'linear-gradient(180deg, #111111 0%, #110a0a 100%)' }}>
      <div className="flex flex-col items-center gap-4">
        <div className="w-10 h-10 rounded-full border-2 border-[#e85d5d]/30 border-t-[#e85d5d] animate-spin" />
        <p className="text-white/35 text-sm">Loading profile…</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen" style={{ background: 'linear-gradient(180deg, #111111 0%, #110a0a 100%)' }}>
      <Header />

      {/* Banner */}
      <div className="relative overflow-hidden" style={{ background: 'linear-gradient(135deg, #0d0d0d 0%, #111111 60%, rgba(232,93,93,0.08) 100%)' }}>
        <div className="absolute inset-0 pointer-events-none"
          style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,0.02) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.02) 1px,transparent 1px)', backgroundSize: '40px 40px' }} />
        <div className="absolute top-0 left-0 right-0 h-px" style={{ background: 'linear-gradient(90deg, transparent, rgba(232,93,93,0.5), transparent)' }} />
        <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-[#0d0d0d] to-transparent pointer-events-none" />

        <div className="relative max-w-5xl mx-auto px-4 sm:px-6 pt-10 pb-16 sm:pt-12 sm:pb-20">
          <div className="flex flex-col sm:flex-row items-center sm:items-end gap-6">
            <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl flex items-center justify-center text-4xl sm:text-5xl font-['Russo_One'] text-white/90 shadow-2xl border-2 flex-shrink-0"
              style={{ background: 'linear-gradient(135deg, rgba(232,93,93,0.25), rgba(232,93,93,0.08))', borderColor: 'rgba(232,93,93,0.35)' }}>
              {(profile?.realName || profile?.user?.username)?.charAt(0)?.toUpperCase() || 'S'}
            </div>
            <div className="flex-1 text-center sm:text-left min-w-0 pb-1">
              <h1 className="font-['Russo_One'] text-3xl sm:text-4xl text-white leading-tight mb-1">
                {profile?.realName || profile?.user?.username || 'Staff Profile'}
              </h1>
              <p className="text-white/40 text-sm mb-2">
                @{profile?.user?.username}
                {profile?.currentRole && <span className="ml-2 text-white/30">· {profile.currentRole}</span>}
              </p>
              {profile?.currentOrganization && (
                <span className="inline-flex items-center gap-1.5 text-amber-400/70 text-xs">
                  <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 21h19.5m-18-18v18m10.5-18v18m6-13.5V21M6.75 6.75h.75m-.75 3h.75m-.75 3h.75m3-6h.75m-.75 3h.75m-.75 3h.75M6.75 21v-3.375c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21" />
                  </svg>
                  {profile.currentOrganization.organizationName}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 -mt-6 pb-16">
        {/* Bio */}
        {profile?.bio && (
          <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] px-5 py-3.5 mb-5">
            <p className="text-white/50 text-sm leading-relaxed">{profile.bio}</p>
          </div>
        )}

        {/* Tabs */}
        <div className="flex gap-0.5 p-1 bg-white/[0.03] border border-white/[0.07] rounded-xl mb-5 overflow-x-auto">
          {([
            { id: 'profile',      label: 'Profile' },
            { id: 'experience',   label: 'Experience' },
            { id: 'skills',       label: 'Skills' },
            { id: 'achievements', label: 'Achievements' },
          ] as const).map((tab) => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)}
              className={`flex-1 min-w-[90px] px-4 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 cursor-pointer ${
                activeTab === tab.id ? 'bg-[#e85d5d] text-white shadow-sm' : 'text-white/40 hover:text-white/70'
              }`}>
              {tab.label}
            </button>
          ))}
        </div>

        {/* ── PROFILE VIEW ── */}
        {activeTab === 'profile' && !isEditingProfile && (
          <div className="rounded-xl border border-white/[0.07] bg-white/[0.02] overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-white/[0.06]">
              <h2 className="font-['Russo_One'] text-base text-white">Staff Info</h2>
              <button onClick={() => setIsEditingProfile(true)}
                className="text-white/50 hover:text-white text-xs border border-white/[0.10] px-3.5 py-1.5 rounded-lg hover:bg-white/[0.05] transition-all cursor-pointer">
                Edit Profile
              </button>
            </div>
            <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-x-10 gap-y-5">
              {[
                { label: 'Username',      value: profile?.user?.username },
                { label: 'Real Name',     value: profile?.realName },
                { label: 'Contact Email', value: profile?.contactEmail },
                { label: 'Contact Phone', value: profile?.contactPhone },
                { label: 'Country',       value: profile?.country },
                { label: 'City',          value: profile?.city },
                { label: 'Nepal Member',  value: profile?.isNepal ? 'Yes 🇳🇵' : null },
              ].map(({ label, value }) => value ? (
                <div key={label}>
                  <p className="text-white/30 text-[10px] uppercase tracking-widest mb-1">{label}</p>
                  <p className="text-white/80 text-sm">{value}</p>
                </div>
              ) : null)}
            </div>
            {profile?.socialLinks && Object.values(profile.socialLinks).some((v: any) => v) && (
              <div className="px-6 pb-6 flex flex-wrap gap-2 border-t border-white/[0.05] pt-5">
                {[
                  { key: 'linkedin',  label: 'LinkedIn',  cls: 'text-sky-400 border-sky-500/25' },
                  { key: 'twitter',   label: 'Twitter',   cls: 'text-sky-400 border-sky-500/25' },
                  { key: 'instagram', label: 'Instagram', cls: 'text-pink-400 border-pink-500/25' },
                  { key: 'discord',   label: 'Discord',   cls: 'text-indigo-400 border-indigo-500/25' },
                  { key: 'website',   label: 'Website',   cls: 'text-white/50 border-white/20' },
                ].map(({ key, label, cls }) => profile.socialLinks[key] ? (
                  <a key={key} href={profile.socialLinks[key]} target="_blank" rel="noopener noreferrer"
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border hover:-translate-y-0.5 transition-all duration-200 ${cls}`}>
                    {label}
                  </a>
                ) : null)}
              </div>
            )}
          </div>
        )}

        {/* ── PROFILE EDIT ── */}
        {activeTab === 'profile' && isEditingProfile && (
          <div className="rounded-xl border border-white/[0.07] bg-white/[0.02] overflow-hidden">
            <div className="px-6 py-4 border-b border-white/[0.06]">
              <h2 className="font-['Russo_One'] text-base text-white">Edit Profile</h2>
            </div>
            <form onSubmit={handleUpdateProfile} className="p-6 space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div><label className={labelCls}>Real Name</label>
                  <input type="text" value={profileForm.realName} className={fieldCls} placeholder="Your real name"
                    onChange={(e) => setProfileForm({ ...profileForm, realName: e.target.value })} /></div>
                <div><label className={labelCls}>Contact Email</label>
                  <input type="email" value={profileForm.contactEmail} className={fieldCls} placeholder="contact@email.com"
                    onChange={(e) => setProfileForm({ ...profileForm, contactEmail: e.target.value })} /></div>
                <div><label className={labelCls}>Contact Phone</label>
                  <input type="tel" value={profileForm.contactPhone} className={fieldCls} placeholder="+977 …"
                    onChange={(e) => setProfileForm({ ...profileForm, contactPhone: e.target.value })} /></div>
                <div><label className={labelCls}>Country</label>
                  <input type="text" value={profileForm.country} className={fieldCls} placeholder="Nepal"
                    onChange={(e) => setProfileForm({ ...profileForm, country: e.target.value })} /></div>
                <div><label className={labelCls}>City</label>
                  <input type="text" value={profileForm.city} className={fieldCls} placeholder="Kathmandu"
                    onChange={(e) => setProfileForm({ ...profileForm, city: e.target.value })} /></div>
                <div><label className={labelCls}>Date of Birth</label>
                  <input type="date" value={profileForm.dateOfBirth} className={fieldCls}
                    onChange={(e) => setProfileForm({ ...profileForm, dateOfBirth: e.target.value })} /></div>
              </div>
              <div><label className={labelCls}>Bio</label>
                <textarea value={profileForm.bio} rows={3} maxLength={1000} className={`${fieldCls} resize-none`}
                  placeholder="Tell us about yourself…"
                  onChange={(e) => setProfileForm({ ...profileForm, bio: e.target.value })} /></div>

              <div className="pt-4 border-t border-white/[0.06]">
                <p className={labelCls}>Social Links</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3">
                  {(['linkedin','twitter','instagram','discord','website'] as const).map((key) => (
                    <div key={key}><label className="block text-white/25 text-[10px] uppercase tracking-widest mb-1 capitalize">{key}</label>
                      <input type="text" value={profileForm.socialLinks[key]} className={fieldCls} placeholder={`https://…`}
                        onChange={(e) => setProfileForm({ ...profileForm, socialLinks: { ...profileForm.socialLinks, [key]: e.target.value } })} /></div>
                  ))}
                </div>
              </div>

              <div className="pt-3 border-t border-white/[0.06] space-y-3">
                <p className={labelCls}>Privacy</p>
                {[
                  { field: 'isProfilePublic' as const, label: 'Make profile public' },
                  { field: 'showContactInfo' as const, label: 'Show contact info publicly' },
                ].map(({ field, label }) => (
                  <label key={field} className="flex items-center gap-3 cursor-pointer">
                    <div onClick={() => setProfileForm({ ...profileForm, [field]: !profileForm[field] })}
                      className={`w-5 h-5 rounded-[4px] border-2 flex items-center justify-center flex-shrink-0 transition-all duration-150 ${profileForm[field] ? 'bg-[#e85d5d] border-[#e85d5d]' : 'border-white/20'}`}>
                      {profileForm[field] && <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5"/></svg>}
                      <input type="checkbox" checked={profileForm[field]} className="sr-only" readOnly />
                    </div>
                    <span className="text-white/55 text-sm">{label}</span>
                  </label>
                ))}
              </div>

              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => { setIsEditingProfile(false); fetchProfile(); }}
                  className="btn-ghost flex-1 py-3 text-sm cursor-pointer">Cancel</button>
                <SaveButton type="submit" saving={savingProfile} label="Save Changes" className="flex-1 py-3 text-sm" />
              </div>
            </form>
          </div>
        )}

        {/* ── EXPERIENCE ── */}
        {activeTab === 'experience' && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-['Russo_One'] text-base text-white/80">Work History</h2>
              <button onClick={() => setShowWorkHistoryModal(true)} className="btn-brand px-4 py-2 text-sm cursor-pointer">
                + Add Experience
              </button>
            </div>
            {profile?.workHistory?.length > 0 ? (
              <div className="space-y-3">
                {profile.workHistory.map((work: any, i: number) => (
                  <div key={i} className="rounded-xl border border-white/[0.07] bg-white/[0.02] p-5">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="text-white font-semibold">{work.role}</h3>
                        <p className="text-[#e85d5d]/80 text-sm">{work.organizationName}</p>
                        {work.department && <p className="text-white/30 text-xs mt-0.5">{work.department}</p>}
                        <p className="text-white/25 text-xs mt-1">
                          {new Date(work.startDate).toLocaleDateString()} –{' '}
                          {work.isCurrent ? 'Present' : new Date(work.endDate).toLocaleDateString()}
                        </p>
                        {work.description && <p className="text-white/50 text-sm mt-2">{work.description}</p>}
                      </div>
                      <button onClick={() => openRemoveConfirm('workHistory', work._id)}
                        className="text-red-400/50 hover:text-red-400 text-xs transition-colors cursor-pointer flex-shrink-0 ml-4">
                        Remove
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center py-16 gap-3 rounded-xl border border-white/[0.06] bg-white/[0.02] text-white/25">
                <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 14.15v4.25c0 1.094-.787 2.036-1.872 2.18-2.087.277-4.216.42-6.378.42s-4.291-.143-6.378-.42c-1.085-.144-1.872-1.086-1.872-2.18v-4.25m16.5 0a2.18 2.18 0 00.75-1.661V8.706c0-1.081-.768-2.015-1.837-2.175a48.114 48.114 0 00-3.413-.387m4.5 8.006c-.194.165-.42.295-.673.38A23.978 23.978 0 0112 15.75c-2.648 0-5.195-.429-7.577-1.22a2.016 2.016 0 01-.673-.38m0 0A2.18 2.18 0 013 12.489V8.706c0-1.081.768-2.015 1.837-2.175a48.111 48.111 0 013.413-.387m7.5 0V5.25A2.25 2.25 0 0013.5 3h-3a2.25 2.25 0 00-2.25 2.25v.894m7.5 0a48.667 48.667 0 00-7.5 0" />
                </svg>
                <p className="text-sm">No work history added yet</p>
              </div>
            )}
          </div>
        )}

        {/* ── SKILLS ── */}
        {activeTab === 'skills' && (
          <div className="space-y-5">
            <div className="rounded-xl border border-white/[0.07] bg-white/[0.02] overflow-hidden">
              <div className="px-6 py-4 border-b border-white/[0.06]">
                <h2 className="font-['Russo_One'] text-base text-white">Skills</h2>
              </div>
              <div className="p-6">
                <div className="flex gap-2 mb-4">
                  <input type="text" value={newSkill} onChange={(e) => setNewSkill(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddSkill())}
                    placeholder="Add a skill…" className={`${fieldCls} flex-1`} />
                  <button onClick={handleAddSkill} className="btn-brand px-4 py-2.5 text-sm cursor-pointer">Add</button>
                </div>
                {profile?.skills?.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {profile.skills.map((skill: string, i: number) => (
                      <span key={i} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border border-white/[0.12] text-white/60 bg-white/[0.04]">
                        {skill}
                        <button onClick={() => handleRemoveSkill(skill)} className="text-white/30 hover:text-white/70 transition-colors cursor-pointer leading-none">×</button>
                      </span>
                    ))}
                  </div>
                ) : <p className="text-white/25 text-sm">No skills added yet</p>}
              </div>
            </div>

            <div className="rounded-xl border border-white/[0.07] bg-white/[0.02] overflow-hidden">
              <div className="px-6 py-4 border-b border-white/[0.06]">
                <h2 className="font-['Russo_One'] text-base text-white">Specializations</h2>
              </div>
              <div className="p-6 flex flex-wrap gap-2">
                {SPECIALIZATIONS.map((spec) => (
                  <button key={spec} onClick={() => toggleSpecialization(spec)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all duration-200 cursor-pointer ${
                      selectedSpecializations.includes(spec)
                        ? 'bg-[#e85d5d]/15 border-[#e85d5d]/40 text-[#e85d5d]'
                        : 'bg-white/[0.04] border-white/[0.10] text-white/40 hover:text-white/70 hover:border-white/20'
                    }`}>
                    {spec}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ── ACHIEVEMENTS ── */}
        {activeTab === 'achievements' && (
          <div className="space-y-5">
            <div className="flex items-center justify-between">
              <h2 className="font-['Russo_One'] text-base text-white/80">Achievements & Certifications</h2>
              <div className="flex gap-2">
                <button onClick={() => setShowAchievementModal(true)} className="btn-brand px-4 py-2 text-sm cursor-pointer">+ Achievement</button>
                <button onClick={() => setShowCertificationModal(true)} className="btn-ghost px-4 py-2 text-sm cursor-pointer">+ Certification</button>
              </div>
            </div>

            {/* Achievements list */}
            <div className="rounded-xl border border-white/[0.07] bg-white/[0.02] overflow-hidden">
              <div className="px-6 py-4 border-b border-white/[0.06]">
                <h3 className="font-['Russo_One'] text-sm text-white/60 uppercase tracking-wider">Achievements</h3>
              </div>
              <div className="p-6">
                {profile?.achievements?.length > 0 ? (
                  <div>
                    {profile.achievements.map((a: any, i: number) => (
                      <div key={i} className="flex gap-4 py-4 border-b border-white/[0.05] last:border-0">
                        <div className="flex flex-col items-center flex-shrink-0 pt-1">
                          <div className="w-2 h-2 rounded-full bg-[#e85d5d]/70" />
                          {i < profile.achievements.length - 1 && <div className="w-px flex-1 bg-white/[0.05] mt-1.5" />}
                        </div>
                        <div className="flex-1 pb-1">
                          <div className="flex items-start justify-between">
                            <div>
                              <p className="text-white/85 font-semibold text-sm mb-0.5">{a.title}</p>
                              {a.organization && <p className="text-[#e85d5d]/60 text-xs">{a.organization}</p>}
                              {a.description && <p className="text-white/40 text-xs leading-relaxed mt-1">{a.description}</p>}
                              {a.date && <p className="text-white/25 text-[11px] mt-1">{new Date(a.date).toLocaleDateString('en-US', { year: 'numeric', month: 'short' })}</p>}
                            </div>
                            <button onClick={() => openRemoveConfirm('achievement', a._id)}
                              className="text-red-400/40 hover:text-red-400 text-xs transition-colors cursor-pointer flex-shrink-0 ml-4">
                              Remove
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : <p className="text-white/25 text-sm">No achievements added yet</p>}
              </div>
            </div>

            {/* Certifications list */}
            <div className="rounded-xl border border-white/[0.07] bg-white/[0.02] overflow-hidden">
              <div className="px-6 py-4 border-b border-white/[0.06]">
                <h3 className="font-['Russo_One'] text-sm text-white/60 uppercase tracking-wider">Certifications</h3>
              </div>
              <div className="p-6">
                {profile?.certifications?.length > 0 ? (
                  <div className="space-y-3">
                    {profile.certifications.map((cert: any, i: number) => (
                      <div key={i} className="flex items-start justify-between py-3 border-b border-white/[0.05] last:border-0">
                        <div>
                          <p className="text-white/85 font-semibold text-sm">{cert.name}</p>
                          {cert.issuer && <p className="text-[#e85d5d]/60 text-xs mt-0.5">{cert.issuer}</p>}
                          {cert.credentialId && <p className="text-white/30 text-xs mt-0.5">ID: {cert.credentialId}</p>}
                          <p className="text-white/25 text-[11px] mt-1">
                            {cert.date && new Date(cert.date).toLocaleDateString('en-US', { year: 'numeric', month: 'short' })}
                            {cert.expiryDate && ` → ${new Date(cert.expiryDate).toLocaleDateString('en-US', { year: 'numeric', month: 'short' })}`}
                          </p>
                        </div>
                        <button onClick={() => openRemoveConfirm('certification', cert._id)}
                          className="text-red-400/40 hover:text-red-400 text-xs transition-colors cursor-pointer flex-shrink-0 ml-4">
                          Remove
                        </button>
                      </div>
                    ))}
                  </div>
                ) : <p className="text-white/25 text-sm">No certifications added yet</p>}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ── WORK HISTORY MODAL ── */}
      {showWorkHistoryModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={() => setShowWorkHistoryModal(false)}>
          <div className="bg-[#161618] border border-white/[0.10] rounded-2xl p-6 w-full max-w-lg shadow-2xl"
            onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-['Russo_One'] text-white text-lg">Add Experience</h2>
              <button onClick={() => setShowWorkHistoryModal(false)}
                className="w-8 h-8 rounded-lg bg-white/[0.05] border border-white/[0.08] flex items-center justify-center text-white/40 hover:text-white hover:bg-white/[0.09] transition-all cursor-pointer">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"/></svg>
              </button>
            </div>
            <form onSubmit={handleAddWorkHistory} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div><label className={labelCls}>Organization <span className="text-[#e85d5d]">*</span></label>
                  <input type="text" value={workHistoryForm.organizationName} required className={fieldCls}
                    onChange={(e) => setWorkHistoryForm({ ...workHistoryForm, organizationName: e.target.value })} /></div>
                <div><label className={labelCls}>Role <span className="text-[#e85d5d]">*</span></label>
                  <input type="text" value={workHistoryForm.role} required className={fieldCls}
                    onChange={(e) => setWorkHistoryForm({ ...workHistoryForm, role: e.target.value })} /></div>
                <div><label className={labelCls}>Department</label>
                  <input type="text" value={workHistoryForm.department} className={fieldCls}
                    onChange={(e) => setWorkHistoryForm({ ...workHistoryForm, department: e.target.value })} /></div>
                <div><label className={labelCls}>Start Date <span className="text-[#e85d5d]">*</span></label>
                  <input type="date" value={workHistoryForm.startDate} required className={fieldCls}
                    onChange={(e) => setWorkHistoryForm({ ...workHistoryForm, startDate: e.target.value })} /></div>
                <div><label className={labelCls}>End Date</label>
                  <input type="date" value={workHistoryForm.endDate} disabled={workHistoryForm.isCurrent}
                    className={`${fieldCls} disabled:opacity-40 disabled:cursor-not-allowed`}
                    onChange={(e) => setWorkHistoryForm({ ...workHistoryForm, endDate: e.target.value })} /></div>
              </div>
              <label className="flex items-center gap-3 cursor-pointer">
                <div onClick={() => setWorkHistoryForm({ ...workHistoryForm, isCurrent: !workHistoryForm.isCurrent })}
                  className={`w-5 h-5 rounded-[4px] border-2 flex items-center justify-center flex-shrink-0 transition-all duration-150 ${workHistoryForm.isCurrent ? 'bg-[#e85d5d] border-[#e85d5d]' : 'border-white/20'}`}>
                  {workHistoryForm.isCurrent && <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5"/></svg>}
                  <input type="checkbox" checked={workHistoryForm.isCurrent} className="sr-only" readOnly />
                </div>
                <span className="text-white/55 text-sm">I currently work here</span>
              </label>
              <div><label className={labelCls}>Description</label>
                <textarea value={workHistoryForm.description} rows={3} maxLength={500} className={`${fieldCls} resize-none`}
                  onChange={(e) => setWorkHistoryForm({ ...workHistoryForm, description: e.target.value })} /></div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowWorkHistoryModal(false)}
                  className="btn-ghost flex-1 py-3 text-sm cursor-pointer">Cancel</button>
                <SaveButton type="submit" saving={savingWorkHistory} label="Add Experience" className="flex-1 py-3 text-sm" />
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── ACHIEVEMENT MODAL ── */}
      {showAchievementModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={() => setShowAchievementModal(false)}>
          <div className="bg-[#161618] border border-white/[0.10] rounded-2xl p-6 w-full max-w-lg shadow-2xl"
            onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-['Russo_One'] text-white text-lg">Add Achievement</h2>
              <button onClick={() => setShowAchievementModal(false)}
                className="w-8 h-8 rounded-lg bg-white/[0.05] border border-white/[0.08] flex items-center justify-center text-white/40 hover:text-white hover:bg-white/[0.09] transition-all cursor-pointer">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"/></svg>
              </button>
            </div>
            <form onSubmit={handleAddAchievement} className="space-y-4">
              <div><label className={labelCls}>Title <span className="text-[#e85d5d]">*</span></label>
                <input type="text" value={achievementForm.title} required className={fieldCls}
                  onChange={(e) => setAchievementForm({ ...achievementForm, title: e.target.value })} /></div>
              <div><label className={labelCls}>Organization</label>
                <input type="text" value={achievementForm.organization} className={fieldCls}
                  onChange={(e) => setAchievementForm({ ...achievementForm, organization: e.target.value })} /></div>
              <div><label className={labelCls}>Date</label>
                <input type="date" value={achievementForm.date} className={fieldCls}
                  onChange={(e) => setAchievementForm({ ...achievementForm, date: e.target.value })} /></div>
              <div><label className={labelCls}>Description</label>
                <textarea value={achievementForm.description} rows={3} className={`${fieldCls} resize-none`}
                  onChange={(e) => setAchievementForm({ ...achievementForm, description: e.target.value })} /></div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowAchievementModal(false)}
                  className="btn-ghost flex-1 py-3 text-sm cursor-pointer">Cancel</button>
                <SaveButton type="submit" saving={savingAchievement} label="Add Achievement" className="flex-1 py-3 text-sm" />
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── CERTIFICATION MODAL ── */}
      {showCertificationModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={() => setShowCertificationModal(false)}>
          <div className="bg-[#161618] border border-white/[0.10] rounded-2xl p-6 w-full max-w-lg shadow-2xl"
            onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-['Russo_One'] text-white text-lg">Add Certification</h2>
              <button onClick={() => setShowCertificationModal(false)}
                className="w-8 h-8 rounded-lg bg-white/[0.05] border border-white/[0.08] flex items-center justify-center text-white/40 hover:text-white hover:bg-white/[0.09] transition-all cursor-pointer">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"/></svg>
              </button>
            </div>
            <form onSubmit={handleAddCertification} className="space-y-4">
              <div><label className={labelCls}>Name <span className="text-[#e85d5d]">*</span></label>
                <input type="text" value={certificationForm.name} required className={fieldCls}
                  onChange={(e) => setCertificationForm({ ...certificationForm, name: e.target.value })} /></div>
              <div><label className={labelCls}>Issuer</label>
                <input type="text" value={certificationForm.issuer} className={fieldCls}
                  onChange={(e) => setCertificationForm({ ...certificationForm, issuer: e.target.value })} /></div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className={labelCls}>Issue Date</label>
                  <input type="date" value={certificationForm.date} className={fieldCls}
                    onChange={(e) => setCertificationForm({ ...certificationForm, date: e.target.value })} /></div>
                <div><label className={labelCls}>Expiry Date</label>
                  <input type="date" value={certificationForm.expiryDate} className={fieldCls}
                    onChange={(e) => setCertificationForm({ ...certificationForm, expiryDate: e.target.value })} /></div>
              </div>
              <div><label className={labelCls}>Credential ID</label>
                <input type="text" value={certificationForm.credentialId} className={fieldCls}
                  onChange={(e) => setCertificationForm({ ...certificationForm, credentialId: e.target.value })} /></div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowCertificationModal(false)}
                  className="btn-ghost flex-1 py-3 text-sm cursor-pointer">Cancel</button>
                <SaveButton type="submit" saving={savingCertification} label="Add Certification" className="flex-1 py-3 text-sm" />
              </div>
            </form>
          </div>
        </div>
      )}

      {showRemoveConfirm && removeAction && (
        <ConfirmDialog
          title={removeAction.type === 'workHistory' ? 'Remove Experience?' : removeAction.type === 'achievement' ? 'Remove Achievement?' : 'Remove Certification?'}
          message="This action cannot be undone."
          confirmText="Remove"
          cancelText="Cancel"
          confirmButtonClass="bg-red-500 hover:bg-red-600"
          onConfirm={handleConfirmRemove}
          onCancel={() => { setShowRemoveConfirm(false); setRemoveAction(null); }}
        />
      )}

      <ToastContainer toasts={toasts} removeToast={removeToast} />
      <Footer />
    </div>
  );
}
