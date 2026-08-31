import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from 'react';
import {
  UserProfile,
  QuizAttempt,
  CertificateRecord,
  LearningProgress,
} from '../types';

interface AuthContextType {
  user: UserProfile | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  authModalOpen: boolean;
  setAuthModalOpen: (open: boolean) => void;
  profileModalOpen: boolean;
  setProfileModalOpen: (open: boolean) => void;
  quizHistoryModalOpen: boolean;
  setQuizHistoryModalOpen: (open: boolean) => void;
  certificatesModalOpen: boolean;
  setCertificatesModalOpen: (open: boolean) => void;
  reviewAttempt: QuizAttempt | null;
  setReviewAttempt: (attempt: QuizAttempt | null) => void;
  loginWithGoogle: (customData?: Partial<UserProfile>) => Promise<UserProfile>;
  logout: () => void;
  updateProfile: (updated: Partial<UserProfile>) => void;
  saveQuizAttempt: (
    attempt: Omit<QuizAttempt, 'id' | 'userId' | 'completedAt'>
  ) => QuizAttempt;
  getQuizAttempts: () => QuizAttempt[];
  getCertificates: () => CertificateRecord[];
  learningProgress: LearningProgress;
  markModuleInteracted: (moduleKey: keyof LearningProgress) => void;
}

const STORAGE_KEY_AUTH = 'blockchain_sim_auth_user_session';
const STORAGE_KEY_PROFILES = 'blockchain_sim_user_profiles_db';
const STORAGE_KEY_ATTEMPTS_PREFIX = 'blockchain_sim_quiz_attempts_';
const STORAGE_KEY_CERTS_PREFIX = 'blockchain_sim_certificates_';
const STORAGE_KEY_PROGRESS_PREFIX = 'blockchain_sim_progress_';

// Default demo account template for standard initial researcher testing
export const DEMO_USER_PROFILE: UserProfile = {
  userId: 'usr_ptl_2312679',
  name: 'Phan Tấn Long',
  email: 'phantanlong121102@gmail.com',
  avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
  studentId: '2312679',
  class: 'CTK47B',
  createdAt: '2026-08-21T00:00:00.000Z',
  updatedAt: '2026-08-21T00:00:00.000Z',
};

const DEFAULT_PROGRESS: LearningProgress = {
  foundations: true,
  blockArchitecture: true,
  decentralizationEvolution: true,
  consensusMechanisms: true,
  sha256: true,
  transaction: true,
  signature: true,
  mempool: true,
  merkleTree: true,
  blockchain: true,
  proofOfWork: true,
  proofOfStake: true,
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [profileModalOpen, setProfileModalOpen] = useState(false);
  const [quizHistoryModalOpen, setQuizHistoryModalOpen] = useState(false);
  const [certificatesModalOpen, setCertificatesModalOpen] = useState(false);
  const [reviewAttempt, setReviewAttempt] = useState<QuizAttempt | null>(null);
  const [learningProgress, setLearningProgress] =
    useState<LearningProgress>(DEFAULT_PROGRESS);

  // Load active user session on startup
  useEffect(() => {
    try {
      const storedSession = localStorage.getItem(STORAGE_KEY_AUTH);
      if (storedSession) {
        const parsed = JSON.parse(storedSession) as UserProfile;
        // Verify in profiles DB
        const profilesDbRaw = localStorage.getItem(STORAGE_KEY_PROFILES);
        const profilesDb = profilesDbRaw ? JSON.parse(profilesDbRaw) : {};
        const freshProfile = profilesDb[parsed.userId] || parsed;
        setUser(freshProfile);

        // Load user learning progress
        const progressRaw = localStorage.getItem(
          `${STORAGE_KEY_PROGRESS_PREFIX}${freshProfile.userId}`
        );
        if (progressRaw) {
          setLearningProgress(JSON.parse(progressRaw));
        }
      } else {
        // By default on initial load, auto-initialize demo profile session for seamless review if desired
        setUser(DEMO_USER_PROFILE);
      }
    } catch (e) {
      console.warn('Error reading stored session:', e);
      setUser(DEMO_USER_PROFILE);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Save session when user changes
  useEffect(() => {
    if (user) {
      try {
        localStorage.setItem(STORAGE_KEY_AUTH, JSON.stringify(user));
        // Update profile in DB
        const profilesDbRaw = localStorage.getItem(STORAGE_KEY_PROFILES);
        const profilesDb = profilesDbRaw ? JSON.parse(profilesDbRaw) : {};
        profilesDb[user.userId] = user;
        localStorage.setItem(
          STORAGE_KEY_PROFILES,
          JSON.stringify(profilesDb)
        );
      } catch (e) {
        console.warn('Error storing auth session:', e);
      }
    } else {
      localStorage.removeItem(STORAGE_KEY_AUTH);
    }
  }, [user]);

  const loginWithGoogle = useCallback(
    async (customData?: Partial<UserProfile>): Promise<UserProfile> => {
      setIsLoading(true);
      // Simulate real secure Google OAuth flow resolution
      await new Promise((res) => setTimeout(res, 400));

      const userId =
        customData?.userId ||
        (customData?.email
          ? `usr_${customData.email.replace(/[^a-zA-Z0-9]/g, '_')}`
          : DEMO_USER_PROFILE.userId);

      const existingProfilesRaw = localStorage.getItem(STORAGE_KEY_PROFILES);
      const existingProfiles = existingProfilesRaw
        ? JSON.parse(existingProfilesRaw)
        : {};

      const now = new Date().toISOString();
      const profile: UserProfile = {
        userId,
        name: customData?.name || DEMO_USER_PROFILE.name,
        email: customData?.email || DEMO_USER_PROFILE.email,
        avatar:
          customData?.avatar ||
          DEMO_USER_PROFILE.avatar,
        studentId: customData?.studentId || DEMO_USER_PROFILE.studentId,
        class: customData?.class || DEMO_USER_PROFILE.class,
        createdAt: existingProfiles[userId]?.createdAt || now,
        updatedAt: now,
      };

      existingProfiles[userId] = profile;
      localStorage.setItem(
        STORAGE_KEY_PROFILES,
        JSON.stringify(existingProfiles)
      );
      localStorage.setItem(STORAGE_KEY_AUTH, JSON.stringify(profile));

      setUser(profile);
      setAuthModalOpen(false);
      setIsLoading(false);
      return profile;
    },
    []
  );

  const logout = useCallback(() => {
    setUser(null);
    localStorage.removeItem(STORAGE_KEY_AUTH);
    setProfileModalOpen(false);
    setQuizHistoryModalOpen(false);
    setCertificatesModalOpen(false);
  }, []);

  const updateProfile = useCallback(
    (updated: Partial<UserProfile>) => {
      if (!user) return;
      const updatedProfile: UserProfile = {
        ...user,
        ...updated,
        email: user.email, // preserve authenticated email
        userId: user.userId,
        updatedAt: new Date().toISOString(),
      };

      setUser(updatedProfile);
    },
    [user]
  );

  const getQuizAttempts = useCallback((): QuizAttempt[] => {
    if (!user) return [];
    try {
      const raw = localStorage.getItem(
        `${STORAGE_KEY_ATTEMPTS_PREFIX}${user.userId}`
      );
      if (!raw) return [];
      const attempts = JSON.parse(raw) as QuizAttempt[];
      return attempts.sort(
        (a, b) =>
          new Date(b.completedAt).getTime() -
          new Date(a.completedAt).getTime()
      );
    } catch (e) {
      console.warn('Error reading quiz attempts:', e);
      return [];
    }
  }, [user]);

  const getCertificates = useCallback((): CertificateRecord[] => {
    if (!user) return [];
    try {
      const raw = localStorage.getItem(
        `${STORAGE_KEY_CERTS_PREFIX}${user.userId}`
      );
      if (!raw) return [];
      return JSON.parse(raw) as CertificateRecord[];
    } catch (e) {
      console.warn('Error reading certificates:', e);
      return [];
    }
  }, [user]);

  const markModuleInteracted = useCallback(
    (moduleKey: keyof LearningProgress) => {
      setLearningProgress((prev) => {
        const next = { ...prev, [moduleKey]: true };
        if (user) {
          try {
            localStorage.setItem(
              `${STORAGE_KEY_PROGRESS_PREFIX}${user.userId}`,
              JSON.stringify(next)
            );
          } catch (e) {
            console.warn('Error saving progress:', e);
          }
        }
        return next;
      });
    },
    [user]
  );

  const saveQuizAttempt = useCallback(
    (
      attemptData: Omit<QuizAttempt, 'id' | 'userId' | 'completedAt'>
    ): QuizAttempt => {
      const currentUserId = user ? user.userId : 'anonymous_guest';
      const attemptId = `att_${Date.now()}_${Math.random()
        .toString(36)
        .substring(2, 7)}`;
      const completedAt = new Date().toISOString();

      const newAttempt: QuizAttempt = {
        ...attemptData,
        id: attemptId,
        userId: currentUserId,
        completedAt,
      };

      if (user) {
        try {
          const raw = localStorage.getItem(
            `${STORAGE_KEY_ATTEMPTS_PREFIX}${user.userId}`
          );
          const existing = raw ? JSON.parse(raw) : [];
          const updatedAttempts = [newAttempt, ...existing];
          localStorage.setItem(
            `${STORAGE_KEY_ATTEMPTS_PREFIX}${user.userId}`,
            JSON.stringify(updatedAttempts)
          );

          // Update learning progress
          setLearningProgress((prev) => {
            const next = { ...prev };
            if (newAttempt.quizId.includes('sha256')) next.sha256 = true;
            if (newAttempt.quizId.includes('tx')) next.transaction = true;
            if (newAttempt.quizId.includes('signature')) next.signature = true;
            if (newAttempt.quizId.includes('mempool')) next.mempool = true;
            if (newAttempt.quizId.includes('merkle')) next.merkleTree = true;
            if (newAttempt.quizId.includes('blockchain'))
              next.blockchain = true;
            if (newAttempt.quizId.includes('consensus')) {
              next.proofOfWork = true;
              next.proofOfStake = true;
            }
            if (newAttempt.quizId.includes('comprehensive')) {
              Object.keys(next).forEach((k) => {
                (next as any)[k] = true;
              });
            }
            localStorage.setItem(
              `${STORAGE_KEY_PROGRESS_PREFIX}${user.userId}`,
              JSON.stringify(next)
            );
            return next;
          });

          // Check for Certificate eligibility (Score >= 75% on Comprehensive v1.0)
          if (
            newAttempt.quizId === 'comprehensive-v1' &&
            newAttempt.score >= 75
          ) {
            const certsRaw = localStorage.getItem(
              `${STORAGE_KEY_CERTS_PREFIX}${user.userId}`
            );
            const certs: CertificateRecord[] = certsRaw
              ? JSON.parse(certsRaw)
              : [];

            const alreadyHasCert = certs.some(
              (c) =>
                c.quizVersion === newAttempt.quizVersion &&
                c.status === 'eligible'
            );

            if (!alreadyHasCert) {
              const certId = `BC-CERT-${Math.floor(
                100000 + Math.random() * 900000
              )}`;
              const level: 'Foundation' | 'Proficient' | 'Mastery' =
                newAttempt.score >= 90
                  ? 'Mastery'
                  : newAttempt.score >= 80
                  ? 'Proficient'
                  : 'Foundation';

              const newCert: CertificateRecord = {
                id: `cert_${Date.now()}`,
                userId: user.userId,
                quizAttemptId: newAttempt.id,
                certificateId: certId,
                quizVersion: newAttempt.quizVersion,
                level,
                score: newAttempt.score,
                issuedAt: completedAt,
                status: 'eligible',
              };

              certs.unshift(newCert);
              localStorage.setItem(
                `${STORAGE_KEY_CERTS_PREFIX}${user.userId}`,
                JSON.stringify(certs)
              );
            }
          }
        } catch (e) {
          console.warn('Error saving quiz attempt:', e);
        }
      }

      return newAttempt;
    },
    [user]
  );

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        authModalOpen,
        setAuthModalOpen,
        profileModalOpen,
        setProfileModalOpen,
        quizHistoryModalOpen,
        setQuizHistoryModalOpen,
        certificatesModalOpen,
        setCertificatesModalOpen,
        reviewAttempt,
        setReviewAttempt,
        loginWithGoogle,
        logout,
        updateProfile,
        saveQuizAttempt,
        getQuizAttempts,
        getCertificates,
        learningProgress,
        markModuleInteracted,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
