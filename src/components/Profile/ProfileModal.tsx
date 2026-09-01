import React, { useState, useRef } from 'react';
import {
  X,
  User,
  Mail,
  GraduationCap,
  Award,
  History,
  CheckCircle2,
  Lock,
  Edit3,
  Save,
  Clock,
  Sparkles,
  BookOpen,
  Camera,
  Upload,
  AlertCircle,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../i18n/LanguageContext';

export const ProfileModal: React.FC = () => {
  const {
    user,
    profileModalOpen,
    setProfileModalOpen,
    setQuizHistoryModalOpen,
    setCertificatesModalOpen,
    updateProfile,
    getQuizAttempts,
    learningProgress,
  } = useAuth();
  const { strings, language } = useLanguage();

  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(user?.name || '');
  const [studentId, setStudentId] = useState(user?.studentId || '');
  const [userClass, setUserClass] = useState(user?.class || '');
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [notification, setNotification] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!profileModalOpen || !user) return null;

  const attempts = getQuizAttempts();
  const totalAttempts = attempts.length;
  const avgScore =
    totalAttempts > 0
      ? Math.round(
          attempts.reduce((acc, curr) => acc + curr.score, 0) / totalAttempts
        )
      : 0;
  const highestScore =
    totalAttempts > 0
      ? Math.max(...attempts.map((a) => a.score))
      : 0;

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUploadError(null);
    const file = e.target.files?.[0];
    if (!file) return;

    // Check supported types
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      setUploadError(
        language === 'vi'
          ? 'Định dạng không hợp lệ. Vui lòng chọn tệp JPG, JPEG, PNG hoặc WEBP.'
          : 'Invalid format. Please select a JPG, JPEG, PNG, or WEBP file.'
      );
      return;
    }

    // Check size limit: max 5 MB = 5 * 1024 * 1024 bytes
    const MAX_SIZE_BYTES = 5 * 1024 * 1024;
    if (file.size > MAX_SIZE_BYTES) {
      setUploadError(
        language === 'vi'
          ? 'Kích thước tệp vượt quá 5MB. Vui lòng chọn ảnh nhỏ hơn 5MB.'
          : 'File size exceeds 5MB limit. Please choose an image smaller than 5MB.'
      );
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      if (typeof reader.result === 'string') {
        setAvatarPreview(reader.result);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfile({
      name: name.trim() || user.name,
      studentId: studentId.trim() || user.studentId,
      class: userClass.trim() || user.class,
      avatar: avatarPreview || user.avatar,
    });
    setIsEditing(false);
    setUploadError(null);
    setNotification(strings.profile.profileUpdated);
    setTimeout(() => setNotification(null), 3000);
  };

  const currentDisplayAvatar =
    avatarPreview ||
    user.avatar ||
    'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80';

  const curriculumTopics = [
    {
      key: 'sha256' as const,
      label: { en: '1. SHA-256 & Hash Primitives', vi: '1. SHA-256 & Hàm Băm Mật Mã' },
      isCompleted: learningProgress.sha256,
      isLocked: false,
    },
    {
      key: 'transaction' as const,
      label: { en: '2. Transactions & States', vi: '2. Cấu Trúc Giao Dịch' },
      isCompleted: learningProgress.transaction,
      isLocked: false,
    },
    {
      key: 'signature' as const,
      label: { en: '3. Chữ Ký Số (ECDSA)', vi: '3. Chữ Ký Số ECDSA SECP256K1' },
      isCompleted: learningProgress.signature,
      isLocked: false,
    },
    {
      key: 'mempool' as const,
      label: { en: '4. Mempool & Gas Prioritization', vi: '4. Hàng Đợi Giao Dịch Mempool' },
      isCompleted: learningProgress.mempool,
      isLocked: false,
    },
    {
      key: 'merkleTree' as const,
      label: { en: '5. Merkle Tree & Log Proofs', vi: '5. Cây Merkle & Bằng Chứng Logarit' },
      isCompleted: learningProgress.merkleTree,
      isLocked: false,
    },
    {
      key: 'blockchain' as const,
      label: { en: '6. Blocks & Chain Immutability', vi: '6. Cấu Trúc Khối & Tính Bất Biến' },
      isCompleted: learningProgress.blockchain,
      isLocked: false,
    },
    {
      key: 'proofOfWork' as const,
      label: { en: '7. Proof of Work', vi: '7. Khai Thác Proof of Work' },
      isCompleted: learningProgress.proofOfWork,
      isLocked: false,
    },
    {
      key: 'proofOfStake' as const,
      label: { en: '8. Proof of Stake', vi: '8. Cơ Chế Đồng Thuận PoS & Slashing' },
      isCompleted: learningProgress.proofOfStake,
      isLocked: false,
    },
    {
      key: 'network' as any,
      label: { en: '9. P2P Network & Broadcasting', vi: '9. Mạng P2P & Đồng Bộ Node' },
      isCompleted: false,
      isLocked: true,
    },
  ];

  return (
    <div
      id="profile-modal-overlay"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#090A0F]/85 backdrop-blur-sm animate-fade-in font-sans"
      onClick={() => setProfileModalOpen(false)}
    >
      <div
        id="profile-modal-container"
        className="relative w-full max-w-2xl bg-[#0C0F14] border border-[#1C2430] rounded-2xl shadow-2xl overflow-hidden p-6 sm:p-8 max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          id="btn-close-profile-modal"
          onClick={() => setProfileModalOpen(false)}
          className="absolute top-4 right-4 p-2 text-[#717B8C] hover:text-[#F2F4F7] rounded-lg hover:bg-[#11161E] transition-colors cursor-pointer"
          aria-label="Close modal"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-[#1C2430]">
          <div className="flex items-center gap-4">
            <div className="relative group">
              <img
                src={currentDisplayAvatar}
                alt={user.name}
                className="w-16 h-16 rounded-full border-2 border-[#1C2430] group-hover:border-[#00C98D]/40 object-cover shadow-lg"
              />
              <span className="absolute bottom-0 right-0 w-4 h-4 rounded-full bg-[#00C98D] border-2 border-[#0C0F14]"></span>
              {isEditing && (
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute inset-0 rounded-full bg-[#090A0F]/80 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center text-[#00C98D] transition-opacity cursor-pointer border border-[#00C98D]/50"
                  title={strings.profile.changeAvatar}
                >
                  <Camera className="w-5 h-5" />
                  <span className="text-[9px] font-semibold mt-0.5">{strings.profile.changeAvatar}</span>
                </button>
              )}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-xl font-bold text-[#F2F4F7] tracking-tight">
                  {user.name}
                </h3>
                <span className="text-xs px-2 py-0.5 rounded bg-[#11161E] text-[#00C98D] font-semibold border border-[#1C2430]">
                  {user.class}
                </span>
              </div>
              <p className="text-xs text-[#717B8C] font-mono mt-0.5">
                MSSV: {user.studentId} · {user.email}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {!isEditing ? (
              <button
                id="btn-edit-profile-start"
                onClick={() => {
                  setName(user.name);
                  setStudentId(user.studentId);
                  setUserClass(user.class);
                  setAvatarPreview(null);
                  setUploadError(null);
                  setIsEditing(true);
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-[#11161E] hover:bg-[#151C26] text-[#A5AFBF] hover:text-[#F2F4F7] text-xs font-medium rounded-lg border border-[#1C2430] transition-colors cursor-pointer"
              >
                <Edit3 className="w-3.5 h-3.5 text-[#00C98D]" />
                <span>{strings.profile.editProfile}</span>
              </button>
            ) : null}
          </div>
        </div>

        {uploadError ? (
          <div className="my-3 p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl text-rose-400 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{uploadError}</span>
          </div>
        ) : null}

        {notification ? (
          <div className="my-4 p-3 bg-[#00C98D]/10 border border-[#00C98D]/30 rounded-xl text-[#00C98D] text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
            <span>{notification}</span>
          </div>
        ) : null}

        {/* Edit Form */}
        {isEditing ? (
          <form
            onSubmit={handleSave}
            className="my-6 p-4 bg-[#090A0F] border border-[#1C2430] rounded-xl space-y-4"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[#00C98D] uppercase tracking-wider">
                {strings.profile.editProfile}
              </span>
              <span className="text-[11px] text-[#717B8C]">
                {strings.profile.avatarSizeLimit}
              </span>
            </div>

            {/* Hidden File Input for Avatar */}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/jpg,image/webp"
              onChange={handleImageChange}
              className="hidden"
            />

            {/* Avatar Upload Trigger Bar */}
            <div className="p-3 bg-[#0C0F14] border border-[#1C2430] rounded-xl flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <img
                  src={currentDisplayAvatar}
                  alt="Avatar preview"
                  className="w-10 h-10 rounded-full border border-[#1C2430] object-cover"
                />
                <div>
                  <p className="text-xs font-semibold text-[#F2F4F7]">
                    {avatarPreview ? (language === 'vi' ? 'Ảnh mới (Xem trước)' : 'New Image (Preview)') : strings.profile.uploadAvatar}
                  </p>
                  <p className="text-[11px] text-[#717B8C] font-mono">
                    JPG, JPEG, PNG, WEBP · Max 5MB
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {avatarPreview && (
                  <button
                    type="button"
                    onClick={() => setAvatarPreview(null)}
                    className="px-2.5 py-1 text-xs text-[#717B8C] hover:text-[#F2F4F7] bg-[#11161E] border border-[#1C2430] rounded-lg cursor-pointer transition-colors"
                  >
                    {language === 'vi' ? 'Khôi phục' : 'Reset'}
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-[#00C98D]/10 hover:bg-[#00C98D]/20 text-[#00C98D] border border-[#00C98D]/30 rounded-lg text-xs font-medium transition-colors cursor-pointer"
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>{strings.profile.uploadAvatar}</span>
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs text-[#A5AFBF] mb-1">
                  {strings.profile.fullName}
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 bg-[#0B0F15] border border-[#1C2430] focus:border-[#00C98D] rounded-lg text-[#F2F4F7] text-xs focus:outline-none transition-colors"
                />
              </div>
              <div>
                <label className="block text-xs text-[#A5AFBF] mb-1">
                  {strings.profile.studentId}
                </label>
                <input
                  type="text"
                  value={studentId}
                  onChange={(e) => setStudentId(e.target.value)}
                  className="w-full px-3 py-2 bg-[#0B0F15] border border-[#1C2430] focus:border-[#00C98D] rounded-lg text-[#F2F4F7] text-xs focus:outline-none transition-colors"
                />
              </div>
              <div>
                <label className="block text-xs text-[#A5AFBF] mb-1">
                  {strings.profile.class}
                </label>
                <input
                  type="text"
                  value={userClass}
                  onChange={(e) => setUserClass(e.target.value)}
                  className="w-full px-3 py-2 bg-[#0B0F15] border border-[#1C2430] focus:border-[#00C98D] rounded-lg text-[#F2F4F7] text-xs focus:outline-none transition-colors"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => {
                  setIsEditing(false);
                  setAvatarPreview(null);
                  setUploadError(null);
                }}
                className="px-3 py-1.5 text-xs text-[#A5AFBF] hover:text-[#F2F4F7] bg-[#11161E] border border-[#1C2430] rounded-lg transition-colors cursor-pointer"
              >
                {strings.profile.cancel}
              </button>
              <button
                type="submit"
                className="flex items-center gap-1.5 px-4 py-1.5 text-xs font-semibold bg-[#00C98D] hover:bg-[#00B982] text-[#090A0F] rounded-lg transition-colors cursor-pointer"
              >
                <Save className="w-3.5 h-3.5" />
                <span>{strings.profile.saveChanges}</span>
              </button>
            </div>
          </form>
        ) : null}

        {/* Academic Stats Overview */}
        <div className="grid grid-cols-3 gap-3 my-6">
          <div className="p-3.5 bg-[#11161E] border border-[#1C2430] rounded-xl text-center">
            <span className="block text-[11px] uppercase tracking-wider text-[#717B8C] font-medium">
              {strings.profile.totalAttempts}
            </span>
            <span className="text-xl font-bold text-[#F2F4F7] font-mono mt-0.5 block">
              {totalAttempts}
            </span>
          </div>

          <div className="p-3.5 bg-[#11161E] border border-[#1C2430] rounded-xl text-center">
            <span className="block text-[11px] uppercase tracking-wider text-[#717B8C] font-medium">
              {strings.profile.avgScore}
            </span>
            <span className="text-xl font-bold text-[#F59E0B] font-mono mt-0.5 block">
              {avgScore}%
            </span>
          </div>

          <div className="p-3.5 bg-[#11161E] border border-[#1C2430] rounded-xl text-center">
            <span className="block text-[11px] uppercase tracking-wider text-[#717B8C] font-medium">
              {strings.profile.bestScore}
            </span>
            <span className="text-xl font-bold text-[#00C98D] font-mono mt-0.5 block">
              {highestScore}%
            </span>
          </div>
        </div>

        {/* Curriculum Progress Tracker */}
        <div className="my-6">
          <div className="mb-3">
            <h4 className="text-sm font-bold text-[#F2F4F7] uppercase tracking-wider flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-[#00C98D]" />
              <span>{strings.profile.learningProgress}</span>
            </h4>
            <p className="text-xs text-[#717B8C] mt-0.5">
              {strings.profile.learningProgressSubtitle}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {curriculumTopics.map((topic, idx) => (
              <div
                key={idx}
                className={`p-2.5 rounded-xl border flex items-center justify-between text-xs transition-colors ${
                  topic.isLocked
                    ? 'bg-[#090A0F]/60 border-[#151C26] text-[#4D5665]'
                    : topic.isCompleted
                    ? 'bg-[#00C98D]/5 border-[#00C98D]/25 text-[#F2F4F7]'
                    : 'bg-[#11161E]/70 border-[#1C2430] text-[#A5AFBF]'
                }`}
              >
                <div className="flex items-center gap-2 font-medium">
                  {topic.isLocked ? (
                    <Lock className="w-3.5 h-3.5 text-[#4D5665] flex-shrink-0" />
                  ) : topic.isCompleted ? (
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#00C98D] flex-shrink-0" />
                  ) : (
                    <div className="w-3.5 h-3.5 rounded-full border border-[#4D5665] flex-shrink-0"></div>
                  )}
                  <span>
                    {language === 'vi' ? topic.label.vi : topic.label.en}
                  </span>
                </div>
                {topic.isLocked ? (
                  <span className="text-[10px] text-[#4D5665] font-mono">
                    {strings.profile.comingLater}
                  </span>
                ) : topic.isCompleted ? (
                  <span className="text-[10px] text-[#00C98D] font-medium">
                    {strings.profile.completed}
                  </span>
                ) : null}
              </div>
            ))}
          </div>
        </div>

        {/* Modal Actions */}
        <div className="pt-4 border-t border-[#1C2430] flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <button
              id="btn-profile-view-history"
              onClick={() => {
                setProfileModalOpen(false);
                setQuizHistoryModalOpen(true);
              }}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-[#11161E] hover:bg-[#151C26] text-[#A5AFBF] hover:text-[#F2F4F7] text-xs font-semibold rounded-xl border border-[#1C2430] transition-colors cursor-pointer"
            >
              <History className="w-4 h-4 text-[#00C98D]" />
              <span>{strings.quizHistory.title}</span>
            </button>

            <button
              id="btn-profile-view-certs"
              onClick={() => {
                setProfileModalOpen(false);
                setCertificatesModalOpen(true);
              }}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-[#11161E] hover:bg-[#151C26] text-[#A5AFBF] hover:text-[#F2F4F7] text-xs font-semibold rounded-xl border border-[#1C2430] transition-colors cursor-pointer"
            >
              <Award className="w-4 h-4 text-[#F59E0B]" />
              <span>{strings.certificates.title}</span>
            </button>
          </div>

          <button
            id="btn-profile-close"
            onClick={() => setProfileModalOpen(false)}
            className="px-4 py-2 bg-[#11161E] hover:bg-[#151C26] text-[#A5AFBF] hover:text-[#F2F4F7] text-xs font-medium rounded-xl border border-[#1C2430] transition-colors cursor-pointer"
          >
            {strings.profile.cancel}
          </button>
        </div>
      </div>
    </div>
  );
};
