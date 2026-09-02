import fs from 'fs';

const content = `import React, { useState, useRef } from 'react';
import {
  X,
  Camera,
  Upload,
  AlertCircle,
  CheckCircle2,
  Save,
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

    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      setUploadError(
        language === 'vi'
          ? 'Định dạng không hợp lệ. Vui lòng chọn tệp JPG, JPEG, PNG hoặc WEBP.'
          : 'Invalid format. Please select a JPG, JPEG, PNG, or WEBP file.'
      );
      return;
    }

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
      avatar: avatarPreview || user.avatar,
    });
    setIsEditing(false);
    setUploadError(null);
    setNotification(strings.profile?.profileUpdated || (language === 'vi' ? 'Đã cập nhật hồ sơ' : 'Profile updated'));
    setTimeout(() => setNotification(null), 3000);
  };

  const currentDisplayAvatar =
    avatarPreview ||
    user.avatar ||
    'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80';

  const curriculumTopics = [
    {
      key: 'sha256' as const,
      label: { en: 'SHA-256 & Hash Primitives', vi: 'SHA-256 & Hàm Băm Mật Mã' },
      isCompleted: learningProgress.sha256,
      isLocked: false,
    },
    {
      key: 'transaction' as const,
      label: { en: 'Transactions & States', vi: 'Cấu Trúc Giao Dịch' },
      isCompleted: learningProgress.transaction,
      isLocked: false,
    },
    {
      key: 'signature' as const,
      label: { en: 'Digital Signatures (ECDSA)', vi: 'Chữ Ký Số ECDSA SECP256K1' },
      isCompleted: learningProgress.signature,
      isLocked: false,
    },
    {
      key: 'mempool' as const,
      label: { en: 'Mempool & Gas Prioritization', vi: 'Hàng Đợi Giao Dịch Mempool' },
      isCompleted: learningProgress.mempool,
      isLocked: false,
    },
    {
      key: 'merkleTree' as const,
      label: { en: 'Merkle Tree & Log Proofs', vi: 'Cây Merkle & Bằng Chứng Logarit' },
      isCompleted: learningProgress.merkleTree,
      isLocked: false,
    },
    {
      key: 'blockchain' as const,
      label: { en: 'Blocks & Chain Immutability', vi: 'Cấu Trúc Khối & Tính Bất Biến' },
      isCompleted: learningProgress.blockchain,
      isLocked: false,
    },
    {
      key: 'proofOfWork' as const,
      label: { en: 'Proof of Work', vi: 'Khai Thác Proof of Work' },
      isCompleted: learningProgress.proofOfWork,
      isLocked: false,
    },
    {
      key: 'proofOfStake' as const,
      label: { en: 'Proof of Stake', vi: 'Cơ Chế Đồng Thuận PoS & Slashing' },
      isCompleted: learningProgress.proofOfStake,
      isLocked: false,
    },
    {
      key: 'network' as any,
      label: { en: 'P2P Network & Broadcasting', vi: 'Mạng P2P & Đồng Bộ Node' },
      isCompleted: false,
      isLocked: true,
    },
  ];

  const completedCount = curriculumTopics.filter(t => t.isCompleted).length;
  const totalCount = curriculumTopics.length;
  const progressPercentage = Math.round((completedCount / totalCount) * 100);

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
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-[#1C2430]">
          <div className="flex items-center gap-4">
            <div className="relative group">
              <img
                src={currentDisplayAvatar}
                alt={user.name}
                className="w-14 h-14 rounded-full object-cover shadow-sm border border-[#1C2430]"
              />
              {isEditing && (
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute inset-0 rounded-full bg-[#090A0F]/80 flex flex-col items-center justify-center text-[#00C98D] cursor-pointer"
                  title={strings.profile?.changeAvatar || (language === 'vi' ? 'Đổi ảnh' : 'Change Avatar')}
                >
                  <Camera className="w-5 h-5" />
                </button>
              )}
            </div>
            <div>
              <h3 className="text-xl font-medium text-[#F2F4F7] font-sans">
                {user.name}
              </h3>
              <p className="text-sm text-[#717B8C] font-sans">
                {language === 'vi' ? 'Hồ Sơ Học Tập' : 'Blockchain Learning Profile'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {!isEditing && (
              <button
                onClick={() => {
                  setName(user.name);
                  setAvatarPreview(null);
                  setUploadError(null);
                  setIsEditing(true);
                }}
                className="px-3 py-1.5 text-xs text-[#A5AFBF] hover:text-[#F2F4F7] font-medium transition-colors cursor-pointer"
              >
                {strings.profile?.editProfile || (language === 'vi' ? 'Sửa hồ sơ' : 'Edit')}
              </button>
            )}
            <button
              onClick={() => setProfileModalOpen(false)}
              className="p-1 text-[#717B8C] hover:text-[#F2F4F7] transition-colors cursor-pointer"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>
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
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/jpg,image/webp"
              onChange={handleImageChange}
              className="hidden"
            />
            
            <div className="p-3 bg-[#0C0F14] border border-[#1C2430] rounded-xl flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <img
                  src={currentDisplayAvatar}
                  alt="Avatar preview"
                  className="w-10 h-10 rounded-full border border-[#1C2430] object-cover"
                />
                <div>
                  <p className="text-xs font-medium text-[#F2F4F7]">
                    {avatarPreview ? (language === 'vi' ? 'Ảnh mới (Xem trước)' : 'New Image (Preview)') : (strings.profile?.uploadAvatar || (language === 'vi' ? 'Tải ảnh lên' : 'Upload Avatar'))}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {avatarPreview && (
                  <button
                    type="button"
                    onClick={() => setAvatarPreview(null)}
                    className="px-2.5 py-1 text-xs text-[#717B8C] hover:text-[#F2F4F7] transition-colors cursor-pointer"
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
                  <span>{strings.profile?.uploadAvatar || (language === 'vi' ? 'Tải ảnh lên' : 'Upload')}</span>
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs text-[#A5AFBF] mb-1 font-sans">
                {strings.profile?.fullName || (language === 'vi' ? 'Họ và tên' : 'Full Name')}
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2 bg-[#0B0F15] border border-[#1C2430] focus:border-[#00C98D] rounded-lg text-[#F2F4F7] text-xs focus:outline-none transition-colors font-sans"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => {
                  setIsEditing(false);
                  setAvatarPreview(null);
                  setUploadError(null);
                }}
                className="px-3 py-1.5 text-xs text-[#A5AFBF] hover:text-[#F2F4F7] transition-colors cursor-pointer"
              >
                {strings.profile?.cancel || (language === 'vi' ? 'Hủy' : 'Cancel')}
              </button>
              <button
                type="submit"
                className="flex items-center gap-1.5 px-4 py-1.5 text-xs font-medium bg-[#00C98D] text-[#090A0F] hover:bg-[#00B982] rounded-lg transition-colors cursor-pointer"
              >
                <Save className="w-3.5 h-3.5" />
                <span>{strings.profile?.saveChanges || (language === 'vi' ? 'Lưu' : 'Save')}</span>
              </button>
            </div>
          </form>
        ) : null}

        {/* Compact Stats */}
        <div className="flex items-center justify-between py-5 border-b border-[#1C2430]">
          <div className="flex-1 text-center border-r border-[#1C2430]">
            <div className="text-xl font-mono text-[#F2F4F7] mb-0.5">{totalAttempts}</div>
            <div className="text-xs text-[#717B8C] font-sans">{strings.profile?.totalAttempts || (language === 'vi' ? 'Lượt Kiểm Tra' : 'Quizzes')}</div>
          </div>
          <div className="flex-1 text-center border-r border-[#1C2430]">
            <div className="text-xl font-mono text-[#F2F4F7] mb-0.5">{avgScore}%</div>
            <div className="text-xs text-[#717B8C] font-sans">{strings.profile?.avgScore || (language === 'vi' ? 'Trung Bình' : 'Average')}</div>
          </div>
          <div className="flex-1 text-center">
            <div className="text-xl font-mono text-[#F2F4F7] mb-0.5">{highestScore}%</div>
            <div className="text-xs text-[#717B8C] font-sans">{strings.profile?.bestScore || (language === 'vi' ? 'Điểm Cao Nhất' : 'Best')}</div>
          </div>
        </div>

        {/* Learning Progress */}
        <div className="py-6 border-b border-[#1C2430]">
          <div className="flex justify-between items-end mb-3">
            <h4 className="text-sm font-medium text-[#F2F4F7] font-sans">
              {strings.profile?.learningProgress || (language === 'vi' ? 'Tiến Độ Học Tập' : 'Learning Progress')}
            </h4>
            <span className="text-sm font-mono text-[#F2F4F7]">
              {completedCount} / {totalCount}
            </span>
          </div>
          
          <div className="flex items-center gap-3 mb-6">
            <div className="flex-1 h-2 bg-[#1C2430] rounded-full overflow-hidden">
              <div 
                className="h-full bg-[#00C98D] rounded-full transition-all duration-500 ease-out" 
                style={{ width: \`\${progressPercentage}%\` }}
              />
            </div>
            <span className="text-sm font-mono text-[#00C98D]">{progressPercentage}%</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-3 font-sans">
            {curriculumTopics.map((topic, idx) => (
              <div key={idx} className="flex items-center gap-2 text-sm">
                {topic.isLocked ? (
                   <span className="text-xs shrink-0">🔒</span>
                ) : topic.isCompleted ? (
                   <span className="text-[#00C98D] shrink-0 font-bold">✓</span>
                ) : (
                   <span className="w-3.5 h-3.5 rounded-full border border-[#4D5665] opacity-50 inline-block shrink-0"></span>
                )}
                <span className={\`truncate \${
                  topic.isLocked ? 'text-[#4D5665]' : 
                  topic.isCompleted ? 'text-[#F2F4F7]' : 'text-[#A5AFBF]'
                }\`}>
                  {language === 'vi' ? topic.label.vi : topic.label.en}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="pt-6 flex items-center justify-between font-sans">
          <div className="flex items-center gap-4">
            <button
              onClick={() => {
                setProfileModalOpen(false);
                setQuizHistoryModalOpen(true);
              }}
              className="text-sm text-[#A5AFBF] hover:text-[#F2F4F7] transition-colors cursor-pointer"
            >
              {strings.quizHistory?.title || (language === 'vi' ? 'Lịch Sử Kiểm Tra' : 'Assessment History')}
            </button>
            <button
              onClick={() => {
                setProfileModalOpen(false);
                setCertificatesModalOpen(true);
              }}
              className="text-sm text-[#717B8C] hover:text-[#A5AFBF] transition-colors cursor-pointer"
            >
              {strings.certificates?.title || (language === 'vi' ? 'Chứng Chỉ' : 'Certificates')}
            </button>
          </div>
          <button
            onClick={() => setProfileModalOpen(false)}
            className="text-sm text-[#A5AFBF] hover:text-[#F2F4F7] transition-colors px-4 py-2 border border-[#1C2430] rounded-lg hover:bg-[#11161E] cursor-pointer"
          >
            {language === 'vi' ? 'Đóng' : 'Close'}
          </button>
        </div>
      </div>
    </div>
  );
};
`

fs.writeFileSync('src/components/Profile/ProfileModal.tsx', content);
