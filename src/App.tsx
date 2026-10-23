import React, { useState, useEffect, useRef } from 'react';
import {
  MessageSquare,
  Users,
  Eye,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  ArrowLeft,
  Search,
  Sparkles,
  Send,
  Pin,
  Clock,
  Award,
  BookOpen,
  GraduationCap,
  Bot,
  UserCheck,
  LogOut,
  X,
  ExternalLink,
  Layers,
  Cpu,
  BarChart3,
  Palette,
  Check,
  Globe2,
  Filter,
  PlayCircle,
  Video,
  Share2,
  Copy,
  Lock,
  Unlock,
  Sliders,
  PlusCircle,
  Flame,
  ThumbsUp,
  Quote,
  ShieldCheck,
  Scale,
  Star,
  Upload,
  Database,
  TrendingUp,
  Trophy,
  FileText,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import confetti from 'canvas-confetti';

export interface ProInteraction {
  id: string;
  proName: string;
  proRole: string;
  proAvatarBg: string;
  forumSource: 'TwoPlusTwo' | 'CardsChat' | 'PokerStrategy' | 'CardPlayer' | 'RunItOnce' | 'CrushLivePoker' | 'RedditPoker';
  stance: 'shove' | 'fold' | 'call' | 'gto' | 'exploit';
  stanceLabel: string;
  stanceColor: string;
  quote: string;
  content: string;
  likes: number;
  timeAgo: string;
}

interface Comment {
  id: string;
  author: string;
  authorBadge: string;
  authorRole: string;
  avatarBg: string;
  time: string;
  content: string;
  likes: number;
}

interface ForumThread {
  id: string;
  mainSection: 'giang-day-nghien-cuu' | 'trao-doi-chinh' | 'tong-hop-dien-dan';
  mainSectionName: string;
  category: 'giao-trinh-clb' | 'nhap-mon' | 'cash-online' | 'giai-dau' | 'toan-hoc' | 'tam-ly';
  categoryName: string;
  subForum: string;
  originalSource: string;
  title: string;
  author: string;
  authorRole: 'Giảng viên' | 'Biên tập' | 'Học viên' | 'Cao Thủ Chiến Thuật' | 'Thành viên VIP';
  authorPosts: number;
  authorJoinDate: string;
  publishedAt: string;
  isSticky?: boolean;
  gameType: string;
  stakes: string;
  views: number;
  replies: number;
  likes: number;
  summary: string;
  handHistory?: string;
  pdfUrl?: string;
  driveLink?: string;
  youtubeUrl?: string;
  youtubeTitle?: string;
  detailedAnalysis: string;
  gtoRecommendations: string;
  keyTakeaways: string[];
  formatTags?: Array<'online' | 'live' | 'tournament' | 'cash'>;
  proInteractions?: ProInteraction[];
  quizChallenge?: {
    level: 1 | 2 | 3 | 4;
    levelName: string;
    levelIcon: string;
    question: string;
    options: string[];
    correctIndex: number;
    explanation: string;
  };
  comments: Comment[];
}

export type MemberRoleGroup = 'athlete' | 'special';
export type SpecialRole = 'admin' | 'coach' | 'advisor';
export type StarLevel = 0 | 1 | 2 | 3 | 4 | 5 | 6;

export interface AthleteVerificationData {
  onlineNickname?: string;
  onlineNetwork?: string;
  sharkscopeUrl?: string;
  sharkscopeProfit?: string;
  sharkscopeVerified?: boolean;

  liveFullName?: string;
  hendonMobUrl?: string;
  gpiRank?: string;
  liveVerified?: boolean;

  // Cổng 3: Cash Game (Statname, SmartHand, Session Log & Xác Nhận Giảng Viên)
  statnameUrl?: string;
  smartHandUrl?: string;
  cashVpipPfr3Bet?: string;
  cashStake?: string;
  cashWinrate?: string;
  bankrollTrackerApp?: string;
  cashGameLog?: string;
  liveCashCoachConfirmed?: boolean;
  cashVerified?: boolean;

  // Cổng 4: Database Tracker & Biểu đồ Graph All-in Adjusted EV
  trackerType?: 'PT4' | 'HM3' | 'Hand2Note';
  sampleHands?: string;
  allInAdjustedEvGraphUrl?: string;
  databaseFileName?: string;
  databaseVerified?: boolean;
}

interface CurrentUser {
  username: string;
  email: string;
  role: 'Giảng viên' | 'Biên tập' | 'Học viên' | 'Thành viên VIP';
  avatar: string;
  wolfLevel?: number;
  wolfTitle?: string;

  // Hệ thống phân cấp 2 nhóm độc lập & Xác thực VĐV
  roleGroup?: MemberRoleGroup;
  specialRole?: SpecialRole;
  starLevel?: StarLevel;
  verification?: AthleteVerificationData;
}

interface ForumStats {
  totalThreads: number;
  totalPosts: number;
  totalMembers: number;
  newRegisteredCount?: number;
  newestMember: string;
  totalViews: number;
  onlineMembers: number;
  onlineUsers?: string[];
  detectedCountry?: string;
  nativeLang?: string;
}

interface SupportedLangItem {
  code: string;
  label: string;
  flag: string;
  countryName: string;
}

const SUPPORTED_LANGUAGES: SupportedLangItem[] = [
  { code: 'vi', label: 'Tiếng Việt', flag: '🇻🇳', countryName: 'Việt Nam' },
  { code: 'en', label: 'English', flag: '🇺🇸', countryName: 'International / US / UK' },
  { code: 'zh-CN', label: '中文 (简体)', flag: '🇨🇳', countryName: 'China / Singapore' },
  { code: 'ja', label: '日本語', flag: '🇯🇵', countryName: 'Japan' },
  { code: 'ko', label: '한국어', flag: '🇰🇷', countryName: 'Korea' },
  { code: 'th', label: 'ภาษาไทย', flag: '🇹🇭', countryName: 'Thailand' },
  { code: 'fr', label: 'Français', flag: '🇫🇷', countryName: 'France' },
  { code: 'de', label: 'Deutsch', flag: '🇩🇪', countryName: 'Germany' },
  { code: 'es', label: 'Español', flag: '🇪🇸', countryName: 'Spain / LatAm' },
  { code: 'pt', label: 'Português', flag: '🇧🇷', countryName: 'Brazil / Portugal' },
  { code: 'ru', label: 'Русский', flag: '🇷🇺', countryName: 'Russia' }
];

type LogoChoice = 'gold-redesign' | 'chrome-redesign' | 'user-sketch' | 'classic-forumvi';

export default function App() {
  const [threads, setThreads] = useState<ForumThread[]>([]);
  const [stats, setStats] = useState<ForumStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedSection, setSelectedSection] = useState<'all' | 'giang-day-nghien-cuu' | 'trao-doi-chinh' | 'tong-hop-dien-dan'>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeThread, setActiveThread] = useState<ForumThread | null>(null);
  const activeThreadIdRef = useRef<string | null>(null);
  const threadsRef = useRef<ForumThread[]>([]);

  useEffect(() => {
    threadsRef.current = threads;
  }, [threads]);

  const hasInitialScrolledRef = useRef(false);

  // Cuộn thẳng tới khu vực bảng diễn đàn chính (1. THẢO LUẬN MỚI), không bị nhảy lên đầu trang logo
  const scrollToForumBoard = (behavior: ScrollBehavior = 'auto') => {
    setTimeout(() => {
      const el = document.getElementById('forum-board-start');
      if (el) {
        el.scrollIntoView({ behavior, block: 'start' });
      }
    }, 50);
  };

  // Định vị thẳng ngay vào khung nội dung Bài viết #1 khi người dùng click vào tiêu đề
  const scrollToThreadContent = () => {
    setTimeout(() => {
      const el = document.getElementById('thread-post-start') || document.getElementById('thread-content-top');
      if (el) {
        el.scrollIntoView({ behavior: 'auto', block: 'start' });
      }
    }, 30);
  };

  // Logo thiết kế lại state
  const [logoStyle, setLogoStyle] = useState<LogoChoice>(() => {
    return (localStorage.getItem('hocpoker_logo_choice') as LogoChoice) || 'gold-redesign';
  });
  const [showLogoModal, setShowLogoModal] = useState(false);

  // Trợ lý AI Cố Vấn
  const [showAiModal, setShowAiModal] = useState(false);
  const [aiQuestion, setAiQuestion] = useState('');
  const [aiResponse, setAiResponse] = useState('');
  const [aiLoading, setAiLoading] = useState(false);

  // Người dùng
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(() => {
    const saved = localStorage.getItem('hocpoker_nguoidung');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return {
          ...parsed,
          roleGroup: parsed.roleGroup || (parsed.role === 'Giảng viên' ? 'special' : 'athlete'),
          specialRole: parsed.specialRole || (parsed.role === 'Giảng viên' ? 'coach' : undefined),
          starLevel: parsed.starLevel !== undefined ? parsed.starLevel : (parsed.role === 'Giảng viên' ? undefined : 2),
        };
      } catch (e) {
        // fallback
      }
    }
    return {
      username: 'Tidu',
      email: 'tidu@hocpoker.forumvi.com',
      role: 'Giảng viên',
      roleGroup: 'special',
      specialRole: 'coach',
      avatar: '/assets/forum/avatar_tidu.jpg',
      wolfLevel: 4,
      wolfTitle: 'Sói Đầu Đàn',
      verification: {
        onlineNickname: 'TiduPoker_VN',
        onlineNetwork: 'GGNetwork (GGPoker)',
        sharkscopeUrl: 'https://www.sharkscope.com/#Player-Statistics//networks/GGNetwork/players/TiduPoker_VN',
        sharkscopeProfit: '+$42,850 (ROI 19.4%)',
        sharkscopeVerified: true,
        liveFullName: 'Nguyen Van Tidu',
        hendonMobUrl: 'https://pokerdb.thehendonmob.com/player.php?a=r&n=Nguyen_Van_Tidu',
        gpiRank: 'GPI #4,210 (Top 5 Vietnam)',
        liveVerified: true,
        trackerType: 'PT4',
        sampleHands: '180,000 Hands',
        databaseFileName: 'PT4_Database_Backup_2025_NL100_NL200.pt4',
        databaseVerified: true,
        cashGameLog: 'Nhật ký cày 600 giờ Cash Live $2/$5 & Online NL200 Zoom',
        cashStake: '$2/$5 Live / NL200 Zoom',
        cashWinrate: '+6.8 bb/100 (EV dương bền vững)',
        cashVerified: true,
      }
    };
  });

  // Hồ Sơ Vận Động Viên & Xác Thực 4 Cổng Dữ Liệu
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [profileSavedToast, setProfileSavedToast] = useState(false);

  // Form states cho 4 cổng xác thực
  const [vOnlineNick, setVOnlineNick] = useState(currentUser?.verification?.onlineNickname || 'TiduPoker_VN');
  const [vOnlineNet, setVOnlineNet] = useState(currentUser?.verification?.onlineNetwork || 'GGNetwork (GGPoker)');
  const [vSharkscopeUrl, setVSharkscopeUrl] = useState(currentUser?.verification?.sharkscopeUrl || 'https://www.sharkscope.com/#Player-Statistics//networks/GGNetwork/players/TiduPoker_VN');
  const [vSharkscopeProfit, setVSharkscopeProfit] = useState(currentUser?.verification?.sharkscopeProfit || '+$42,850 (ROI 19.4%)');
  const [vSharkscopeVerified, setVSharkscopeVerified] = useState(currentUser?.verification?.sharkscopeVerified ?? true);

  const [vLiveName, setVLiveName] = useState(currentUser?.verification?.liveFullName || 'Nguyen Van Tidu');
  const [vHendonUrl, setVHendonUrl] = useState(currentUser?.verification?.hendonMobUrl || 'https://pokerdb.thehendonmob.com/player.php?a=r&n=Nguyen_Van_Tidu');
  const [vGpiRank, setVGpiRank] = useState(currentUser?.verification?.gpiRank || 'GPI #4,210 (Top 5 Vietnam)');
  const [vLiveVerified, setVLiveVerified] = useState(currentUser?.verification?.liveVerified ?? true);

  const [vTrackerType, setVTrackerType] = useState<'PT4' | 'HM3' | 'Hand2Note'>(currentUser?.verification?.trackerType || 'PT4');
  const [vSampleHands, setVSampleHands] = useState(currentUser?.verification?.sampleHands || '85,000 Hands (Mẫu tối thiểu 50k - 100k)');
  const [vDatabaseFile, setVDatabaseFile] = useState(currentUser?.verification?.databaseFileName || 'PT4_Database_Backup_2025_NL100_NL200.pt4');
  const [vAllInEvGraphUrl, setVAllInEvGraphUrl] = useState(currentUser?.verification?.allInAdjustedEvGraphUrl || 'PT4_Graph_AllIn_Adjusted_EV.png');
  const [vDatabaseVerified, setVDatabaseVerified] = useState(currentUser?.verification?.databaseVerified ?? true);

  const [vStatnameUrl, setVStatnameUrl] = useState(currentUser?.verification?.statnameUrl || 'https://statname.net/player/tidu_cash');
  const [vSmartHandUrl, setVSmartHandUrl] = useState(currentUser?.verification?.smartHandUrl || 'https://smarthand.pro/player/tidu_cash');
  const [vCashVpipPfr3Bet, setVCashVpipPfr3Bet] = useState(currentUser?.verification?.cashVpipPfr3Bet || 'VPIP 23.5% | PFR 19.2% | 3-Bet 8.8%');
  const [vCashStake, setVCashStake] = useState(currentUser?.verification?.cashStake || '$2/$5 Live / NL200 Zoom (GGPoker, PokerStars)');
  const [vCashWinrate, setVCashWinrate] = useState(currentUser?.verification?.cashWinrate || '+6.8 bb/100 (Hourly: $48/giờ)');
  const [vBankrollTrackerApp, setVBankrollTrackerApp] = useState(currentUser?.verification?.bankrollTrackerApp || 'Poker Bankroll Tracker');
  const [vCashLog, setVCashLog] = useState(currentUser?.verification?.cashGameLog || 'Session Log 450 giờ cày Cash Live $2/$5 & Poker Bankroll Tracker');
  const [vLiveCashCoachConfirmed, setVLiveCashCoachConfirmed] = useState(currentUser?.verification?.liveCashCoachConfirmed ?? true);
  const [vCashVerified, setVCashVerified] = useState(currentUser?.verification?.cashVerified ?? true);

  // Bộ chọn sao & nhóm trong modal
  const [editRoleGroup, setEditRoleGroup] = useState<MemberRoleGroup>(currentUser?.roleGroup || 'special');
  const [editSpecialRole, setEditSpecialRole] = useState<SpecialRole>(currentUser?.specialRole || 'coach');
  const [editStarLevel, setEditStarLevel] = useState<StarLevel>(currentUser?.starLevel !== undefined ? currentUser.starLevel : 4);

  useEffect(() => {
    if (currentUser) {
      setEditRoleGroup(currentUser.roleGroup || (currentUser.role === 'Giảng viên' ? 'special' : 'athlete'));
      setEditSpecialRole(currentUser.specialRole || (currentUser.role === 'Giảng viên' ? 'coach' : 'advisor'));
      setEditStarLevel(currentUser.starLevel !== undefined ? currentUser.starLevel : 2);
      if (currentUser.verification) {
        setVOnlineNick(currentUser.verification.onlineNickname || '');
        setVOnlineNet(currentUser.verification.onlineNetwork || 'GGNetwork (GGPoker)');
        setVSharkscopeUrl(currentUser.verification.sharkscopeUrl || '');
        setVSharkscopeProfit(currentUser.verification.sharkscopeProfit || '');
        setVSharkscopeVerified(currentUser.verification.sharkscopeVerified ?? false);
        setVLiveName(currentUser.verification.liveFullName || '');
        setVHendonUrl(currentUser.verification.hendonMobUrl || '');
        setVGpiRank(currentUser.verification.gpiRank || '');
        setVLiveVerified(currentUser.verification.liveVerified ?? false);
        setVTrackerType(currentUser.verification.trackerType || 'PT4');
        setVSampleHands(currentUser.verification.sampleHands || '');
        setVDatabaseFile(currentUser.verification.databaseFileName || '');
        setVAllInEvGraphUrl(currentUser.verification.allInAdjustedEvGraphUrl || '');
        setVDatabaseVerified(currentUser.verification.databaseVerified ?? false);
        setVStatnameUrl(currentUser.verification.statnameUrl || '');
        setVSmartHandUrl(currentUser.verification.smartHandUrl || '');
        setVCashVpipPfr3Bet(currentUser.verification.cashVpipPfr3Bet || '');
        setVBankrollTrackerApp(currentUser.verification.bankrollTrackerApp || 'Poker Bankroll Tracker');
        setVCashLog(currentUser.verification.cashGameLog || '');
        setVCashStake(currentUser.verification.cashStake || '');
        setVCashWinrate(currentUser.verification.cashWinrate || '');
        setVLiveCashCoachConfirmed(currentUser.verification.liveCashCoachConfirmed ?? false);
        setVCashVerified(currentUser.verification.cashVerified ?? false);
      }
    }
  }, [currentUser]);

  const [selectedQuizAnswer, setSelectedQuizAnswer] = useState<number | null>(null);
  const [quizResult, setQuizResult] = useState<'correct' | 'wrong' | null>(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [regUsername, setRegUsername] = useState('');
  const [regRole, setRegRole] = useState<'Học viên' | 'Biên tập' | 'Giảng viên'>('Học viên');

  // Bình luận
  const [commentText, setCommentText] = useState('');
  const [commentStance, setCommentStance] = useState<'shove' | 'fold' | 'gto' | 'exploit'>('exploit');
  const [submittingComment, setSubmittingComment] = useState(false);
  const [lastLiveSync, setLastLiveSync] = useState<Date>(new Date());

  // Lọc thể loại Phân khu 1
  const [pk1FormatFilter, setPk1FormatFilter] = useState<'all' | 'online' | 'live' | 'tournament' | 'cash'>('all');
  const [pk1StanceFilters, setPk1StanceFilters] = useState<Record<string, string>>({});
  const [expandedProThreadId, setExpandedProThreadId] = useState<string | null>(null);
  const [proStanceFilter, setProStanceFilter] = useState<'all' | 'shove' | 'fold' | 'call' | 'gto' | 'exploit'>('all');
  const [proLikes, setProLikes] = useState<Record<string, number>>({});

  const handleLikePro = (e: React.MouseEvent, proId: string, initialLikes: number) => {
    e.stopPropagation();
    setProLikes((prev) => ({
      ...prev,
      [proId]: (prev[proId] !== undefined ? prev[proId] : initialLikes) + 1
    }));
  };

  const handleReplyToPro = (proName: string, forumSource: string) => {
    setCommentText(`@${proName} (${forumSource}): Phản biện theo tư duy thực chiến CLB: `);
    const commentEl = document.getElementById('forum-comment-box');
    if (commentEl) {
      commentEl.scrollIntoView({ behavior: 'smooth' });
      commentEl.focus();
    }
  };

  // Khung nhập thông số bàn chơi Phân khu 2 (Bàn Mổ Xẻ & AI Trọng Tài)
  const [showHandForm, setShowHandForm] = useState(false);
  const [submittingHand, setSubmittingHand] = useState(false);
  const [handForm, setHandForm] = useState({
    title: '',
    position: 'BTN (Button)',
    stack: '100BB (Sâu)',
    gameType: 'Cash Game 6-max',
    stage: 'Đánh tiền mặt',
    cards: 'A♠ K♠',
    board: 'K♦ 7♣ 2♠',
    situation: ''
  });

  const getSessionId = () => {
    let sid = localStorage.getItem('hocpoker_session_id');
    if (!sid) {
      sid = 'sess-' + Math.random().toString(36).substring(2, 10) + '-' + Date.now();
      localStorage.setItem('hocpoker_session_id', sid);
    }
    return sid;
  };

  // ========================================================
  // HỆ THỐNG NGÔN NGỮ BẢN ĐỊA TỰ ĐỘNG & MỞ KHÓA NGÔN NGỮ KHÁC
  // - Xem quảng cáo dài (60s): Mở khóa đúng 1 chủ đề trong 30 phút (thoát QC = cancel dịch, sang chủ đề khác phải xem tiếp)
  // - Gói Subscribe: Theo Tháng (30 ngày) hoặc Theo Năm (365 ngày, giá = 10 tháng). Không có gói vĩnh viễn.
  // ========================================================
  const AD_DURATION_SECONDS = 60; // Quảng cáo 1 phút (60s) khi đổi ngôn ngữ toàn chủ đề sang ngoại ngữ
  const AD_COMMENTS_DURATION_SECONDS = 60; // Quảng cáo 1 phút (60s) khi mở khóa dịch 1 lần hoặc dùng AI 1 lần
  const SINGLE_TOPIC_DURATION_MS = 30 * 60 * 1000; // Thời hạn xem bản dịch / AI 1 chủ đề: 30 phút
  const DAILY_PRICE_VND = 5000; // 5.000đ / ngày (Cốc trà đá)
  const MONTHLY_PRICE_VND = 45000; // 45.000đ / tháng
  const YEARLY_PRICE_VND = 450000; // Gói năm tính = 10 tháng (450.000đ / năm)
  const THREE_YEAR_PRICE_VND = 1125000; // Gói 3 năm (1.125.000đ / 3 năm - Giảm 17%)

  // Danh sách video chính thức từ kênh YouTube @choipoker của chủ diễn đàn
  const CHOIPOKER_YOUTUBE_VIDEOS = [
    {
      id: 'L8AnuzAt6RM',
      title: 'Hành trình thế kỷ của Poker: Trò chơi này đã chinh phục thế giới như thế nào?'
    },
    {
      id: 'VVbPonEeERQ',
      title: 'Ảo tưởng khi chơi Poker: Bạn thắng bằng trình hay chỉ nhờ may mắn? 😄'
    },
    {
      id: 'gT9M2E0JnbY',
      title: 'History of Poker and how to play Poker on top of the world class'
    },
    {
      id: 'Gu0w2SslPXI',
      title: 'Tình huống dễ gặp phải hàng ngày thì dùng kiến thức Poker có giải quyết được không 😏'
    },
    {
      id: 'eMwIkuWC_p4',
      title: 'Tố cho vui được không?'
    },
    {
      id: 'ZyZ7vD3o1S4',
      title: 'Cầm KK bị đấm vào mặt 😏'
    },
    {
      id: 'W1j2R0VyTng',
      title: 'Quan sát ai dễ nhất 🥹'
    }
  ];

  const detectFallbackNativeLang = (): string => {
    try {
      const tz = Intl.DateTimeFormat().resolvedOptions().timeZone || '';
      if (tz.includes('Saigon') || tz.includes('Ho_Chi_Minh') || (tz.includes('Bangkok') === false && navigator.language?.startsWith('vi'))) {
        return 'vi';
      }
      if (tz.includes('Tokyo')) return 'ja';
      if (tz.includes('Seoul')) return 'ko';
      if (tz.includes('Shanghai') || tz.includes('Hong_Kong') || tz.includes('Taipei')) return 'zh-CN';
      if (tz.includes('Bangkok')) return 'th';
      if (tz.includes('Paris')) return 'fr';
      if (tz.includes('Berlin')) return 'de';
      if (tz.includes('Madrid') || tz.includes('Mexico')) return 'es';
      if (tz.includes('Sao_Paulo') || tz.includes('Lisbon')) return 'pt';
      if (tz.includes('Moscow')) return 'ru';
    } catch {}
    return 'vi';
  };

  interface AdTopicTranslationSession {
    lang: string;
    threadId: string; // ID của đúng 1 chủ đề được phép xem (hoặc 'FIRST_OPENED_THREAD' nếu bắt đầu từ trang danh sách)
    threadTitle?: string;
    expiresAt: number; // Thời điểm hết hạn (30 phút kể từ khi dịch xong)
  }

  interface LangSubscription {
    plan: 'day' | 'month' | 'year' | '3year';
    expiresAt: number;
  }

  const [nativeLang, setNativeLang] = useState<string>(() => detectFallbackNativeLang());
  const [detectedCountryCode, setDetectedCountryCode] = useState<string>('VN');
  const [activeLang, setActiveLang] = useState<string>(() => detectFallbackNativeLang());
  const [pendingLang, setPendingLang] = useState<string | null>(null);
  const [langModalMode, setLangModalMode] = useState<'topic-lang' | 'comments-native'>('topic-lang');
  const [showLangModal, setShowLangModal] = useState<boolean>(false);
  const [adPlaying, setAdPlaying] = useState<boolean>(false);
  const [adSecondsLeft, setAdSecondsLeft] = useState<number>(AD_DURATION_SECONDS);
  const [activeYoutubeIdx, setActiveYoutubeIdx] = useState<number>(0);
  const [selectedSubPlan, setSelectedSubPlan] = useState<'day' | 'month' | 'year' | '3year'>('day');
  const [subCodeInput, setSubCodeInput] = useState<string>('');
  const [verifyingQrPayment, setVerifyingQrPayment] = useState<boolean>(false);
  const [verifyQrCountdown, setVerifyQrCountdown] = useState<number>(0);
  const [qrOrderCode] = useState<string>(() => 'CP' + Math.floor(1000 + Math.random() * 9000));

  const VIETQR_BANK_ID = 'MB';
  const VIETQR_BANK_NAME = 'MBBank (Định Danh VA)';
  const VIETQR_ACCOUNT_NO = 'VQRQANAKX0402';
  const VIETQR_ACCOUNT_NAME = 'ForumP';

  // Phiên mở khóa bản dịch các bình luận khác dưới 1 chủ đề (xem QC 30s -> xem được 30 phút cho đúng chủ đề đó)
  const [commentsUnlockSession, setCommentsUnlockSession] = useState<{ threadId: string; expiresAt: number } | null>(() => {
    try {
      const saved = localStorage.getItem('hocpoker_comments_unlock_session');
      if (!saved) return null;
      const parsed = JSON.parse(saved);
      if (parsed.expiresAt && parsed.expiresAt > Date.now()) return parsed;
      localStorage.removeItem('hocpoker_comments_unlock_session');
      return null;
    } catch {
      return null;
    }
  });
  const [commentsRemainingSec, setCommentsRemainingSec] = useState<number>(0);

  const [langSub, setLangSub] = useState<LangSubscription | null>(() => {
    try {
      const saved = localStorage.getItem('hocpoker_lang_sub');
      if (!saved) return null;
      const parsed: LangSubscription = JSON.parse(saved);
      if (parsed.expiresAt && parsed.expiresAt > Date.now()) return parsed;
      localStorage.removeItem('hocpoker_lang_sub');
      return null;
    } catch {
      return null;
    }
  });

  const [adTopicSession, setAdTopicSession] = useState<AdTopicTranslationSession | null>(() => {
    try {
      const saved = localStorage.getItem('hocpoker_ad_topic_session');
      if (!saved) return null;
      const parsed: AdTopicTranslationSession = JSON.parse(saved);
      if (parsed.expiresAt && parsed.expiresAt > Date.now()) return parsed;
      localStorage.removeItem('hocpoker_ad_topic_session');
      return null;
    } catch {
      return null;
    }
  });

  const [adRemainingSec, setAdRemainingSec] = useState<number>(0);
  const hasAutoAppliedNativeRef = useRef<boolean>(false);

  const applyLanguageToDOM = (langCode: string) => {
    setActiveLang(langCode);

    if (langCode === 'vi') {
      document.cookie = 'googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
      document.cookie = `googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; domain=.${window.location.hostname}; path=/;`;
    } else {
      document.cookie = `googtrans=/vi/${langCode}; path=/`;
    }

    const triggerCombo = (attempt = 0) => {
      const selectEl = document.querySelector('.goog-te-combo') as HTMLSelectElement | null;
      if (selectEl) {
        selectEl.value = langCode;
        selectEl.dispatchEvent(new Event('change'));
      } else if (attempt < 15 && langCode !== 'vi') {
        setTimeout(() => triggerCombo(attempt + 1), 350);
      }
    };
    triggerCombo();
  };

  const hasActiveSubscription = (): boolean => {
    if (!langSub) return false;
    return langSub.expiresAt > Date.now();
  };

  const areCommentsUnlockedForTopic = (targetThreadId: string | null = activeThread?.id || activeThreadIdRef.current): boolean => {
    if (hasActiveSubscription()) return true;
    if (commentsUnlockSession && targetThreadId && commentsUnlockSession.threadId === targetThreadId && commentsUnlockSession.expiresAt > Date.now()) {
      return true;
    }
    return false;
  };

  // Bộ đếm kiểm tra thời hạn 30 phút của bản dịch các bình luận trong 1 chủ đề
  useEffect(() => {
    if (!commentsUnlockSession) {
      setCommentsRemainingSec(0);
      return;
    }
    const tick = () => {
      const leftMs = commentsUnlockSession.expiresAt - Date.now();
      if (leftMs <= 0) {
        setCommentsUnlockSession(null);
        localStorage.removeItem('hocpoker_comments_unlock_session');
        setCommentsRemainingSec(0);
      } else {
        setCommentsRemainingSec(Math.ceil(leftMs / 1000));
      }
    };
    tick();
    const timer = setInterval(tick, 1000);
    return () => clearInterval(timer);
  }, [commentsUnlockSession]);

  const handleOpenUnlockCommentsModal = () => {
    setLangModalMode('comments-native');
    setPendingLang(nativeLang);
    setAdSecondsLeft(AD_COMMENTS_DURATION_SECONDS); // 30 giây quảng cáo cho phần bình luận
    setAdPlaying(false); // Khi click vào hiện bảng giải thích dịch cần thời gian và nút "Xem quảng cáo ngay"
    setShowLangModal(true);
  };

  const isLanguageUnlockedForCurrentTopic = (
    langCode: string,
    currentNative = nativeLang,
    targetThreadId: string | null = activeThreadIdRef.current
  ): boolean => {
    // 1. Ngôn ngữ bản địa của quốc gia người dùng luôn MIỄN PHÍ 100% cho bài viết chính #1
    if (langCode === currentNative) return true;
    // 2. Có gói Subscribe Tháng / Năm còn hạn
    if (hasActiveSubscription()) return true;
    // 3. Mở khóa bằng Quảng cáo dài: chỉ có hiệu lực cho ĐÚNG 1 CHỦ ĐỀ và trong 30 PHÚT
    if (adTopicSession && adTopicSession.lang === langCode && adTopicSession.expiresAt > Date.now()) {
      if (adTopicSession.threadId === 'FIRST_OPENED_THREAD') return true;
      if (targetThreadId && adTopicSession.threadId === targetThreadId) return true;
    }
    return false;
  };

  // Bộ đếm kiểm tra thời hạn 30 phút của bản dịch 1 chủ đề mỗi giây
  useEffect(() => {
    if (!adTopicSession) {
      setAdRemainingSec(0);
      return;
    }
    const tick = () => {
      const leftMs = adTopicSession.expiresAt - Date.now();
      if (leftMs <= 0) {
        // Hết 30 phút -> Hủy bản dịch và quay về ngôn ngữ bản địa
        setAdTopicSession(null);
        localStorage.removeItem('hocpoker_ad_topic_session');
        if (!hasActiveSubscription()) {
          applyLanguageToDOM(nativeLang);
        }
        setAdRemainingSec(0);
      } else {
        setAdRemainingSec(Math.ceil(leftMs / 1000));
      }
    };
    tick();
    const timer = setInterval(tick, 1000);
    return () => clearInterval(timer);
  }, [adTopicSession, nativeLang, langSub]);

  const handleSelectLanguage = (targetLang: string) => {
    if (targetLang === activeLang) return;
    if (isLanguageUnlockedForCurrentTopic(targetLang, nativeLang, activeThread?.id || null)) {
      applyLanguageToDOM(targetLang);
    } else {
      setLangModalMode('topic-lang');
      setPendingLang(targetLang);
      setAdSecondsLeft(AD_DURATION_SECONDS);
      setAdPlaying(false); // Khi click vào hiện bảng giải thích dịch cần thời gian và nút "Xem quảng cáo ngay"
      setShowLangModal(true);
    }
  };

  // Thoát quảng cáo giữa chừng -> Cancel dịch luôn
  const handleCancelAdAndTranslation = () => {
    setAdPlaying(false);
    setAdSecondsLeft(langModalMode === 'comments-native' ? AD_COMMENTS_DURATION_SECONDS : AD_DURATION_SECONDS);
    setPendingLang(null);
    setShowLangModal(false);
  };

  // Đếm ngược quảng cáo trong lúc dịch (60s khi đổi ngoại ngữ toàn bài, hoặc 30s khi mở khóa dịch các bình luận khác sang ngôn ngữ bản địa)
  useEffect(() => {
    if (!showLangModal || !adPlaying) return;
    if (adSecondsLeft <= 0) {
      const expireAt = Date.now() + SINGLE_TOPIC_DURATION_MS; // Đúng 30 phút
      if (langModalMode === 'comments-native') {
        const cSession = {
          threadId: activeThread ? activeThread.id : 'GLOBAL_AI_SESSION',
          expiresAt: expireAt
        };
        setCommentsUnlockSession(cSession);
        localStorage.setItem('hocpoker_comments_unlock_session', JSON.stringify(cSession));
      } else if (pendingLang) {
        const session: AdTopicTranslationSession = {
          lang: pendingLang,
          threadId: activeThread ? activeThread.id : 'FIRST_OPENED_THREAD',
          threadTitle: activeThread ? activeThread.title : undefined,
          expiresAt: expireAt
        };
        setAdTopicSession(session);
        localStorage.setItem('hocpoker_ad_topic_session', JSON.stringify(session));
        applyLanguageToDOM(pendingLang);
      }
      setAdPlaying(false);
      setShowLangModal(false);
      return;
    }
    const timer = setTimeout(() => {
      setAdSecondsLeft((prev) => prev - 1);
    }, 1000);
    return () => clearTimeout(timer);
  }, [showLangModal, adPlaying, adSecondsLeft, pendingLang, activeThread, langModalMode]);

  // Kiểm tra giao dịch thực tế từ tài khoản Vietcombank (chặn 100% người bấm khống)
  const handleStartAutoVerifyQr = async () => {
    setVerifyingQrPayment(true);
    setVerifyQrCountdown(6);

    try {
      // Gọi kiểm tra biến động số dư thực tế tại Vietcombank qua API
      const res = await fetch(`${API_BASE}/api/forum/payment/check-status?code=${qrOrderCode}`);
      const data = await res.json();

      setTimeout(() => {
        setVerifyingQrPayment(false);

        if (data.paid) {
          const approvedPlan = (data.plan as 'day' | 'month' | 'year' | '3year') || selectedSubPlan;
          let durationMs = 24 * 60 * 60 * 1000; // 1 ngày
          if (approvedPlan === '3year') {
            durationMs = 3 * 365 * 24 * 60 * 60 * 1000;
          } else if (approvedPlan === 'year') {
            durationMs = 365 * 24 * 60 * 60 * 1000;
          } else if (approvedPlan === 'month') {
            durationMs = 30 * 24 * 60 * 60 * 1000;
          }
          const sub: LangSubscription = {
            plan: approvedPlan,
            expiresAt: Date.now() + durationMs
          };
          setLangSub(sub);
          localStorage.setItem('hocpoker_lang_sub', JSON.stringify(sub));
          if (pendingLang && langModalMode === 'topic-lang') {
            applyLanguageToDOM(pendingLang);
          }
          setShowLangModal(false);
          confetti({ particleCount: 90, spread: 70, origin: { y: 0.6 } });
          alert(`🎉 CHÚC MỪNG!\n${data.message}\nMã kích hoạt VIP của Quý khách: ${data.activationCode}`);
        } else {
          const currentMemo =
            selectedSubPlan === '3year'
              ? `forum3Y ${qrOrderCode}`
              : selectedSubPlan === 'year'
              ? `Forum (M) ${qrOrderCode}`
              : selectedSubPlan === 'month'
              ? `forumM ${qrOrderCode}`
              : `forumD ${qrOrderCode}`;
          alert(`⚠️ CHƯA NHẬN ĐƯỢC TIỀN VÀO MBBANK:\n\n${data.message}\n\n👉 Vui lòng mở ứng dụng ngân hàng, kiểm tra đã bấm "Xác nhận chuyển khoản" thành công với nội dung "${currentMemo}" chưa nhé!`);
        }
      }, 3500);
    } catch (e) {
      setTimeout(() => {
        setVerifyingQrPayment(false);
        alert(`⚠️ Hệ thống chưa thể kết nối kiểm tra tài khoản MBBank lúc này. Quý khách vui lòng thử lại sau giây lát hoặc chụp biên lai giao dịch gửi Admin hỗ trợ ngay nhé!`);
      }, 2000);
    }
  };

  const handleActivateSubscription = (e: React.FormEvent) => {
    e.preventDefault();
    const code = subCodeInput.trim().toUpperCase();
    if (code === 'SUBDAY' || code === 'NGAY' || code === 'TRADA' || code === 'FORUMD' || code === 'VIPDAY') {
      const sub: LangSubscription = {
        plan: 'day',
        expiresAt: Date.now() + 24 * 60 * 60 * 1000
      };
      setLangSub(sub);
      localStorage.setItem('hocpoker_lang_sub', JSON.stringify(sub));
      if (pendingLang) applyLanguageToDOM(pendingLang);
      setShowLangModal(false);
      setSubCodeInput('');
    } else if (code === 'SUBMONTH' || code === 'THANG' || code === 'VIPMONTH' || code === 'FORUMM') {
      const sub: LangSubscription = {
        plan: 'month',
        expiresAt: Date.now() + 30 * 24 * 60 * 60 * 1000
      };
      setLangSub(sub);
      localStorage.setItem('hocpoker_lang_sub', JSON.stringify(sub));
      if (pendingLang) applyLanguageToDOM(pendingLang);
      setShowLangModal(false);
      setSubCodeInput('');
    } else if (code === 'SUBYEAR' || code === 'NAM' || code === 'VIPYEAR' || code === 'VIPPOKER' || code === 'FORUM (M)' || code === 'FORUM(M)') {
      const sub: LangSubscription = {
        plan: 'year',
        expiresAt: Date.now() + 365 * 24 * 60 * 60 * 1000
      };
      setLangSub(sub);
      localStorage.setItem('hocpoker_lang_sub', JSON.stringify(sub));
      if (pendingLang) applyLanguageToDOM(pendingLang);
      setShowLangModal(false);
      setSubCodeInput('');
    } else if (code === 'SUB3YEAR' || code === '3NAM' || code === 'VIP3YEAR' || code === 'FORUM3Y' || code === 'FORUM 3(M)' || code === 'FORUM3M') {
      const sub: LangSubscription = {
        plan: '3year',
        expiresAt: Date.now() + 3 * 365 * 24 * 60 * 60 * 1000
      };
      setLangSub(sub);
      localStorage.setItem('hocpoker_lang_sub', JSON.stringify(sub));
      if (pendingLang) applyLanguageToDOM(pendingLang);
      setShowLangModal(false);
      setSubCodeInput('');
    } else {
      const planName =
        selectedSubPlan === '3year'
          ? 'Gói 3 Năm (Giảm 17%): 1.125.000đ'
          : selectedSubPlan === 'year'
          ? 'Gói 1 Năm: 450.000đ'
          : selectedSubPlan === 'month'
          ? 'Gói 1 Tháng: 45.000đ'
          : 'Gói 1 Ngày (Cốc trà đá): 5.000đ';
      alert(
        `Vui lòng hoàn tất đăng ký gói thuê bao (${planName}) để nhận mã kích hoạt, hoặc chọn Xem Quảng Cáo 1 phút để dịch / dùng AI miễn phí trong 30 phút!`
      );
    }
  };

  const syncStatsAndNativeLanguage = (statsData: ForumStats) => {
    setStats(statsData);
    if (statsData.detectedCountry) {
      setDetectedCountryCode(statsData.detectedCountry);
    }
    if (statsData.nativeLang) {
      setNativeLang(statsData.nativeLang);
      if (!hasAutoAppliedNativeRef.current) {
        hasAutoAppliedNativeRef.current = true;
        applyLanguageToDOM(statsData.nativeLang);
      }
    }
  };

  const API_BASE =
    typeof window !== 'undefined' &&
    (window.location.hostname.endsWith('github.io') || window.location.hostname.endsWith('gitlab.io'))
      ? 'https://choipoker.vercel.app'
      : '';

  const fetchRealStats = async (usernameOverride?: string) => {
    try {
      const sid = getSessionId();
      const uname = usernameOverride !== undefined ? usernameOverride : (currentUser?.username || 'Khách');
      const statsRes = await fetch(`${API_BASE}/api/forum/stats?sessionId=${encodeURIComponent(sid)}&username=${encodeURIComponent(uname)}`);
      if (statsRes.ok) {
        const statsData = await statsRes.json();
        syncStatsAndNativeLanguage(statsData);
      }
    } catch (e) {
      console.error('Lỗi cập nhật thống kê thực tế:', e);
    }
  };

  useEffect(() => {
    fetchRealStats(currentUser?.username || 'Khách');
  }, [currentUser?.username]);

  const fetchForumData = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (selectedSection !== 'all') params.append('section', selectedSection);
      if (selectedCategory !== 'all') params.append('category', selectedCategory);
      if (searchQuery.trim()) params.append('search', searchQuery.trim());

      const sid = getSessionId();
      const uname = currentUser?.username || 'Khách';

      const [threadsRes, statsRes] = await Promise.all([
        fetch(`${API_BASE}/api/forum/threads?${params.toString()}`),
        fetch(`${API_BASE}/api/forum/stats?sessionId=${encodeURIComponent(sid)}&username=${encodeURIComponent(uname)}`)
      ]);

      if (threadsRes.ok) {
        const data = await threadsRes.json();
        setThreads(data.threads || []);
        setLastLiveSync(new Date());
        if (!hasInitialScrolledRef.current) {
          hasInitialScrolledRef.current = true;
          if (!window.location.hash.startsWith('#thread-')) {
            scrollToForumBoard('auto');
          }
        }
      }
      if (statsRes.ok) {
        const statsData = await statsRes.json();
        syncStatsAndNativeLanguage(statsData);
      }
    } catch (err) {
      console.error('Lỗi nạp dữ liệu diễn đàn:', err);
    } finally {
      setLoading(false);
    }
  };

  // Đồng bộ định kỳ: 6 tiếng 1 lần (chuẩn diễn đàn nghiên cứu, không chạy đua như tin tức)
  const SIX_HOURS_MS = 6 * 60 * 60 * 1000;

  const fetchForumDataSilently = async () => {
    // Nếu người dùng đã vào diễn đàn con / đang đọc bài viết:
    // Tuyệt đối KHÔNG đồng bộ với bên ngoài để bảo đảm đọc yên tĩnh, không bị nhảy giật hay reset giao diện
    if (activeThreadIdRef.current !== null) {
      return;
    }

    try {
      const params = new URLSearchParams();
      if (selectedSection !== 'all') params.append('section', selectedSection);
      if (selectedCategory !== 'all') params.append('category', selectedCategory);
      if (searchQuery.trim()) params.append('search', searchQuery.trim());

      const [threadsRes, statsRes] = await Promise.all([
        fetch(`${API_BASE}/api/forum/threads?${params.toString()}`),
        fetch(`${API_BASE}/api/forum/stats`)
      ]);

      // Kiểm tra lại: nếu người dùng vừa bấm vào diễn đàn con trong lúc đang fetch thì hủy cập nhật
      if (activeThreadIdRef.current !== null) {
        return;
      }

      if (threadsRes.ok) {
        const data = await threadsRes.json();
        const newThreads: ForumThread[] = data.threads || [];
        setThreads(newThreads);
        setLastLiveSync(new Date());
      }
      if (statsRes.ok) {
        const statsData = await statsRes.json();
        syncStatsAndNativeLanguage(statsData);
      }
    } catch (err) {
      console.error('Silent sync error:', err);
    }
  };

  useEffect(() => {
    if (activeThreadIdRef.current === null) {
      fetchForumData();
    }
  }, [selectedSection, selectedCategory]);

  useEffect(() => {
    // Chỉ đồng bộ ngầm định kỳ 6 tiếng 1 lần và chỉ khi đang ở ngoài danh sách diễn đàn
    const timer = setInterval(() => {
      if (activeThreadIdRef.current === null) {
        fetchForumDataSilently();
      }
    }, SIX_HOURS_MS);
    return () => clearInterval(timer);
  }, [selectedSection, selectedCategory, searchQuery]);

  // Lắng nghe URL Hash (#thread-{id}) để mở trực tiếp ván bài / bài viết khi chia sẻ link hoặc bấm Back
  useEffect(() => {
    const handleHash = () => {
      const hash = window.location.hash;
      if (hash.startsWith('#thread-')) {
        const tId = hash.replace('#thread-', '');
        // Nếu bài viết này đã và đang được hiển thị thì tuyệt đối không cuộn lại để người dùng đọc yên tĩnh
        if (activeThreadIdRef.current === tId) {
          return;
        }

        const found = threadsRef.current.find((t) => t.id === tId);
        if (found) {
          activeThreadIdRef.current = tId;
          setActiveThread(found);
          scrollToThreadContent();
        } else if (tId) {
          fetch(`${API_BASE}/api/forum/threads/${tId}`)
            .then((r) => r.json())
            .then((d) => {
              if (d.thread && window.location.hash === `#thread-${tId}`) {
                activeThreadIdRef.current = tId;
                setActiveThread(d.thread);
                scrollToThreadContent();
              }
            })
            .catch(() => {});
        }
      } else {
        // Nếu người dùng nhấn Back trên trình duyệt để quay lại diễn đàn chính
        if (activeThreadIdRef.current !== null) {
          activeThreadIdRef.current = null;
          setActiveThread(null);
          scrollToForumBoard('auto');
        }
      }
    };

    window.addEventListener('hashchange', handleHash);
    // Xử lý hash khi tải trang lần đầu
    handleHash();
    return () => window.removeEventListener('hashchange', handleHash);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchForumData();
  };

  const handleOpenThread = (t: ForumThread) => {
    activeThreadIdRef.current = t.id;
    setActiveThread(t);
    setSelectedQuizAnswer(null);
    setQuizResult(null);

    // Nếu không có gói Hội viên Tháng/Năm và chuyển sang chủ đề khác -> kết thúc phiên mở khóa bình luận của chủ đề cũ
    if (!hasActiveSubscription() && commentsUnlockSession && commentsUnlockSession.threadId !== t.id) {
      setCommentsUnlockSession(null);
      localStorage.removeItem('hocpoker_comments_unlock_session');
    }

    // Kiểm tra quyền xem bản dịch 1 chủ đề qua quảng cáo:
    // - Nếu vừa xem quảng cáo ở ngoài trang chủ ('FIRST_OPENED_THREAD') -> khóa chặt vào đúng chủ đề đầu tiên này
    // - Nếu chuyển sang chủ đề thứ 2 khác với chủ đề đã dịch -> hủy bản dịch ngay, quay về ngôn ngữ bản địa (muốn dịch tiếp thì xem tiếp)
    if (!hasActiveSubscription() && activeLang !== nativeLang) {
      if (adTopicSession && adTopicSession.expiresAt > Date.now()) {
        if (adTopicSession.threadId === 'FIRST_OPENED_THREAD') {
          const lockedSession: AdTopicTranslationSession = {
            ...adTopicSession,
            threadId: t.id,
            threadTitle: t.title
          };
          setAdTopicSession(lockedSession);
          localStorage.setItem('hocpoker_ad_topic_session', JSON.stringify(lockedSession));
        } else if (adTopicSession.threadId !== t.id) {
          // Chuyển sang chủ đề khác -> Hết quyền xem bản dịch của chủ đề trước
          setAdTopicSession(null);
          localStorage.removeItem('hocpoker_ad_topic_session');
          applyLanguageToDOM(nativeLang);
        }
      } else {
        applyLanguageToDOM(nativeLang);
      }
    }

    window.location.hash = `thread-${t.id}`;
    scrollToThreadContent();
  };

  const handleCloseThread = () => {
    // Nếu đang dùng bản dịch 1 chủ đề qua quảng cáo và thoát khỏi chủ đề đó -> kết thúc phiên dịch 1 chủ đề
    if (!hasActiveSubscription() && activeLang !== nativeLang && adTopicSession && adTopicSession.threadId !== 'FIRST_OPENED_THREAD') {
      setAdTopicSession(null);
      localStorage.removeItem('hocpoker_ad_topic_session');
      applyLanguageToDOM(nativeLang);
    }

    activeThreadIdRef.current = null;
    setActiveThread(null);
    if (window.location.hash) {
      history.pushState('', document.title, window.location.pathname + window.location.search);
    }
    scrollToForumBoard('auto');
  };

  const handleSubmitHand = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!handForm.situation.trim()) {
      alert('Vui lòng nhập mô tả diễn biến ván bài & thắc mắc cần phân tích!');
      return;
    }
    setSubmittingHand(true);
    try {
      const res = await fetch(`${API_BASE}/api/forum/submit-hand`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          author: currentUser?.username || 'Thành viên CLB',
          position: handForm.position,
          stack: handForm.stack,
          gameType: handForm.gameType,
          stage: handForm.stage,
          cards: handForm.cards,
          board: handForm.board,
          situation: handForm.situation,
          title: handForm.title.trim() || undefined
        })
      });
      if (res.ok) {
        const data = await res.json();
        if (data.thread) {
          setThreads((prev) => [data.thread, ...prev]);
          setShowHandForm(false);
          setHandForm({
            title: '',
            position: 'BTN (Button)',
            stack: '100BB (Sâu)',
            gameType: 'Cash Game 6-max',
            stage: 'Đánh tiền mặt',
            cards: 'A♠ K♠',
            board: 'K♦ 7♣ 2♠',
            situation: ''
          });
          handleOpenThread(data.thread);
          confetti({ particleCount: 80, spread: 70, origin: { y: 0.6 } });
        }
      } else {
        alert('Không thể gửi ván bài lên bàn mổ xẻ. Vui lòng thử lại!');
      }
    } catch (err) {
      console.error(err);
      alert('Lỗi kết nối khi gửi ván bài.');
    } finally {
      setSubmittingHand(false);
    }
  };

  const handleSolveQuiz = () => {
    if (!activeThread?.quizChallenge || selectedQuizAnswer === null) return;
    const isCorrect = selectedQuizAnswer === activeThread.quizChallenge.correctIndex;
    if (isCorrect) {
      setQuizResult('correct');
      confetti({ particleCount: 70, spread: 60, origin: { y: 0.7 } });
      if (currentUser && (currentUser.wolfLevel || 1) < activeThread.quizChallenge.level + 1) {
        const nextLevel = Math.min(4, activeThread.quizChallenge.level + 1);
        const titles = ['', 'Gà Mới Nhập Đàn', 'Sói Tập Sự', 'Sói Thực Chiến', 'Sói Đầu Đàn'];
        const updated = {
          ...currentUser,
          wolfLevel: nextLevel,
          wolfTitle: titles[nextLevel]
        };
        setCurrentUser(updated);
        localStorage.setItem('hocpoker_nguoidung', JSON.stringify(updated));
      }
    } else {
      setQuizResult('wrong');
    }
  };

  const handleOpenCurriculum = async (threadId: string) => {
    let t = threads.find((item) => item.id === threadId);
    if (!t) {
      try {
        const res = await fetch(`${API_BASE}/api/forum/threads/${threadId}`);
        if (res.ok) {
          const data = await res.json();
          t = data.thread;
        }
      } catch (err) {
        console.error('Lỗi nạp bài viết giáo trình:', err);
      }
    }
    if (t) {
      handleOpenThread(t);
    }
  };

  const [shareToast, setShareToast] = useState(false);

  useEffect(() => {
    if (activeThread) {
      document.title = `${activeThread.title} | Học Poker`;
      const metaDesc = document.querySelector('meta[name="description"]');
      if (metaDesc) metaDesc.setAttribute('content', activeThread.summary);
      const ogTitle = document.querySelector('meta[property="og:title"]');
      if (ogTitle) ogTitle.setAttribute('content', activeThread.title);
      const ogDesc = document.querySelector('meta[property="og:description"]');
      if (ogDesc) ogDesc.setAttribute('content', activeThread.summary);
    } else {
      document.title = 'Học Poker - Diễn Đàn Chơi Poker (3 Phân Khu)';
      const metaDesc = document.querySelector('meta[name="description"]');
      if (metaDesc) metaDesc.setAttribute('content', 'Diễn đàn Học Poker (choipoker.vercel.app) gồm 3 phân khu độc lập: (1) Trạm Tình Báo Quốc Tế, (2) Bàn Mổ Xẻ & AI Trọng Tài, (3) Lò Luyện Từ Gà Hóa Sói.');
      const ogTitle = document.querySelector('meta[property="og:title"]');
      if (ogTitle) ogTitle.setAttribute('content', 'Học Poker - Chúng Tôi Chơi Poker (3 Phân Khu)');
      const ogDesc = document.querySelector('meta[property="og:description"]');
      if (ogDesc) ogDesc.setAttribute('content', 'Diễn đàn Học Poker với 3 phân khu độc lập: Trạm Tình Báo Quốc Tế, Bàn Mổ Xẻ & AI Trọng Tài, Lò Luyện Từ Gà Hóa Sói.');
    }
  }, [activeThread]);

  const handleShareThread = () => {
    if (!activeThread) return;
    const shareUrl = `${window.location.origin}/#thread-${activeThread.id}`;
    const shareText = `[Học Poker - ${activeThread.subForum || 'Diễn Đàn'}] ${activeThread.title}\n\n📖 Tóm tắt: ${activeThread.summary}\n🔗 Xem chi tiết: ${shareUrl}`;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(shareText);
      setShareToast(true);
      setTimeout(() => setShareToast(false), 3000);
    }
  };

  const handleSelectLogo = (choice: LogoChoice) => {
    setLogoStyle(choice);
    localStorage.setItem('hocpoker_logo_choice', choice);
    confetti({
      particleCount: 50,
      spread: 60,
      origin: { y: 0.3 }
    });
  };

  const handleRegisterOrLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!regUsername.trim()) return;

    const trimmed = regUsername.trim();
    const isTidu = trimmed.toLowerCase() === 'tidu';
    const initialWolfLevel = (isTidu || regRole === 'Giảng viên') ? 4 : (authMode === 'register' ? 1 : (currentUser?.wolfLevel || 1));
    const titles = ['', 'Gà Mới Nhập Đàn', 'Sói Tập Sự', 'Sói Thực Chiến', 'Sói Đầu Đàn'];

    const user: CurrentUser = {
      username: trimmed,
      email: `${trimmed.toLowerCase()}@hocpoker.forumvi.com`,
      role: isTidu ? 'Giảng viên' : regRole,
      avatar: (isTidu || regRole === 'Giảng viên') ? '/assets/forum/avatar_tidu.jpg' : 'bg-emerald-600',
      wolfLevel: initialWolfLevel,
      wolfTitle: titles[initialWolfLevel]
    };

    localStorage.setItem('hocpoker_nguoidung', JSON.stringify(user));
    setCurrentUser(user);
    setShowAuthModal(false);

    // Lưu vào Cloud DB cho Trợ lý Admin theo dõi và gửi email thông báo
    if (authMode === 'register') {
      try {
        fetch(`${API_BASE}/api/forum/register`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            username: trimmed,
            role: isTidu ? 'Giảng viên' : regRole,
            wolfLevel: initialWolfLevel,
            wolfTitle: titles[initialWolfLevel]
          })
        })
          .then(() => fetchRealStats(trimmed))
          .catch(() => {});

        fetch('https://formsubmit.co/ajax/tidu888@gmail.com', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          body: JSON.stringify({
            _subject: `🔔 [Chơi Poker] Thành viên mới đăng ký: ${trimmed}`,
            _template: 'table',
            'Tài khoản đăng ký': trimmed,
            'Vai trò': isTidu ? 'Giảng viên' : regRole,
            'Cấp bậc ban đầu': titles[initialWolfLevel],
            'Thời gian': new Date().toLocaleString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh' }),
            'Website': 'https://choipoker.vercel.app'
          })
        }).catch(() => {});
      } catch (err) {
        console.error('Lỗi gửi mail thông báo:', err);
      }
    }

    confetti({
      particleCount: 60,
      spread: 60,
      origin: { y: 0.6 }
    });
  };

  const handleQuickLogin = (
    username: string,
    role: 'Giảng viên' | 'Biên tập' | 'Học viên',
    level: number,
    title: string,
    avatar: string,
    roleGroup?: MemberRoleGroup,
    specialRole?: SpecialRole,
    starLevel?: StarLevel
  ) => {
    const user: CurrentUser = {
      username,
      email: `${username.toLowerCase()}@hocpoker.forumvi.com`,
      role,
      avatar,
      wolfLevel: level,
      wolfTitle: title,
      roleGroup: roleGroup || (role === 'Giảng viên' ? 'special' : 'athlete'),
      specialRole: specialRole || (role === 'Giảng viên' ? 'coach' : undefined),
      starLevel: starLevel !== undefined ? starLevel : (role === 'Giảng viên' ? undefined : 2)
    };
    localStorage.setItem('hocpoker_nguoidung', JSON.stringify(user));
    setCurrentUser(user);
    setShowAuthModal(false);
    confetti({ particleCount: 50, spread: 50, origin: { y: 0.5 } });
  };

  const handleLogout = () => {
    localStorage.removeItem('hocpoker_nguoidung');
    setCurrentUser(null);
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;

    const updated: CurrentUser = {
      ...currentUser,
      roleGroup: editRoleGroup,
      specialRole: editRoleGroup === 'special' ? editSpecialRole : undefined,
      starLevel: editRoleGroup === 'athlete' ? editStarLevel : undefined,
      verification: {
        onlineNickname: vOnlineNick,
        onlineNetwork: vOnlineNet,
        sharkscopeUrl: vSharkscopeUrl,
        sharkscopeProfit: vSharkscopeProfit,
        sharkscopeVerified: vSharkscopeVerified,
        liveFullName: vLiveName,
        hendonMobUrl: vHendonUrl,
        gpiRank: vGpiRank,
        liveVerified: vLiveVerified,
        trackerType: vTrackerType,
        sampleHands: vSampleHands,
        databaseFileName: vDatabaseFile,
        allInAdjustedEvGraphUrl: vAllInEvGraphUrl,
        databaseVerified: vDatabaseVerified,
        statnameUrl: vStatnameUrl,
        smartHandUrl: vSmartHandUrl,
        cashVpipPfr3Bet: vCashVpipPfr3Bet,
        bankrollTrackerApp: vBankrollTrackerApp,
        cashGameLog: vCashLog,
        cashStake: vCashStake,
        cashWinrate: vCashWinrate,
        liveCashCoachConfirmed: vLiveCashCoachConfirmed,
        cashVerified: vCashVerified,
      }
    };

    localStorage.setItem('hocpoker_nguoidung', JSON.stringify(updated));
    setCurrentUser(updated);
    setProfileSavedToast(true);
    setTimeout(() => setProfileSavedToast(false), 3000);

    // Lưu hồ sơ vào Cloud DB cho Trợ lý Admin theo dõi và gửi email thông báo
    try {
      fetch(`${API_BASE}/api/forum/verify-profile`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: currentUser.username,
          proposedStar: editRoleGroup === 'athlete' ? `${editStarLevel} Sao` : 'Nhóm Ban Điều Hành',
          onlineMtt: `${vOnlineNick} (${vOnlineNet}) - ${vSharkscopeProfit}`,
          liveMtt: `${vLiveName} - ${vGpiRank}`,
          database: `${vTrackerType} | ${vSampleHands} | ${vDatabaseFile}`,
          cashGame: `Statname: ${vStatnameUrl} | Winrate: ${vCashWinrate}`
        })
      }).catch(() => {});

      fetch('https://formsubmit.co/ajax/tidu888@gmail.com', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          _subject: `⭐ [Chơi Poker] Hồ sơ xét duyệt VĐV: ${currentUser.username}`,
          _template: 'table',
          'Tài khoản VĐV': currentUser.username,
          'Cấp sao đề xuất': editRoleGroup === 'athlete' ? `${editStarLevel} Sao` : 'Nhóm Ban Điều Hành',
          'Online MTT (SharkScope)': `${vOnlineNick} (${vOnlineNet}) - ${vSharkscopeProfit} | Link: ${vSharkscopeUrl}`,
          'Live MTT (Hendon Mob / GPI)': `${vLiveName} - ${vGpiRank} | Link: ${vHendonUrl}`,
          'Database Cá Nhân': `${vTrackerType} | Mẫu: ${vSampleHands} | File: ${vDatabaseFile}`,
          'Cash Game': `Statname: ${vStatnameUrl} | SmartHand: ${vSmartHandUrl} | Winrate: ${vCashWinrate}`,
          'Thời gian nộp hồ sơ': new Date().toLocaleString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh' }),
          'Website': 'https://choipoker.vercel.app'
        })
      }).catch(() => {});
    } catch (err) {
      console.error('Lỗi gửi mail xét duyệt:', err);
    }

    confetti({ particleCount: 70, spread: 60, origin: { y: 0.6 } });
  };

  const handlePostComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim() || !activeThread || !currentUser) return;

    setSubmittingComment(true);
    try {
      const res = await fetch(`${API_BASE}/api/forum/threads/${activeThread.id}/comment`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          author: currentUser.username,
          authorRole: currentUser.role,
          content: commentText.trim(),
          stance: commentStance,
          stanceLabel:
            commentStance === 'shove'
              ? '🔥 Ủng hộ Tố / Shove All-in'
              : commentStance === 'fold'
              ? '🛡️ Khuyên Bỏ Bài / Fold'
              : commentStance === 'gto'
              ? '🧠 Phân Tích Solver GTO'
              : '🎯 Góc Nhìn Thực Chiến Thành Viên'
        })
      });

      if (res.ok) {
        const data = await res.json();
        const updatedComments = [...activeThread.comments, data.comment];
        const updatedProInteractions = data.proInteraction && activeThread.proInteractions
          ? [...activeThread.proInteractions, data.proInteraction]
          : activeThread.proInteractions;

        const updatedThread: ForumThread = {
          ...activeThread,
          replies: data.totalReplies,
          comments: updatedComments,
          proInteractions: updatedProInteractions
        };

        setActiveThread(updatedThread);
        setThreads((prev) =>
          prev.map((t) => (t.id === activeThread.id ? updatedThread : t))
        );
        setCommentText('');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSubmittingComment(false);
    }
  };

  const handleAskAi = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!aiQuestion.trim()) return;

    setAiLoading(true);
    setAiResponse('');
    try {
      const res = await fetch(`${API_BASE}/api/gemini/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: aiQuestion.trim() })
      });
      const data = await res.json();
      setAiResponse(data.text || 'Không có phản hồi từ trợ lý.');
    } catch (err: any) {
      setAiResponse('Lỗi kết nối tới trợ lý AI. Vui lòng thử lại sau.');
    } finally {
      setAiLoading(false);
    }
  };

  const renderUserRankBadge = (user: {
    roleGroup?: MemberRoleGroup;
    specialRole?: SpecialRole;
    starLevel?: StarLevel;
    role?: string;
    username?: string;
  }) => {
    // 1. Nhóm Đặc Biệt (Admin 👑, Giảng Viên 🎓, Ban Cố Vấn ⚖️) - KHÔNG DÙNG HỆ SAO
    const isSpecial =
      user.roleGroup === 'special' ||
      user.specialRole ||
      user.role === 'Giảng viên' ||
      user.username?.toLowerCase() === 'tidu' ||
      user.username?.toLowerCase().includes('admin');

    if (isSpecial) {
      const sRole =
        user.specialRole ||
        (user.username?.toLowerCase().includes('admin')
          ? 'admin'
          : user.username?.toLowerCase() === 'tidu' || user.role === 'Giảng viên'
          ? 'coach'
          : 'advisor');

      if (sRole === 'admin') {
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-black bg-gradient-to-r from-red-600 via-rose-600 to-amber-500 text-white border border-red-300 shadow-md">
            <span>👑</span>
            <span>Admin / Chủ nhiệm CLB</span>
          </span>
        );
      }
      if (sRole === 'coach') {
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-black bg-gradient-to-r from-amber-500 to-[#8b6b23] text-slate-950 border border-amber-300 shadow-md">
            <span>🐺</span>
            <span>Giảng viên (Coach)</span>
          </span>
        );
      }
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-black bg-gradient-to-r from-emerald-600 to-teal-700 text-white border border-emerald-400 shadow-md">
          <span>⚖️</span>
          <span>AI Trọng Tài / Chuyên Gia</span>
        </span>
      );
    }

    // 2. Nhóm Vận Động Viên (0 Sao ☆ đến 6 Sao ★★★★★★)
    const stars = user.starLevel !== undefined ? user.starLevel : 0;
    switch (stars) {
      case 6:
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-black bg-gradient-to-r from-purple-700 via-pink-600 to-amber-400 text-white border border-amber-300 shadow-lg">
            <span className="tracking-tight text-amber-300 font-serif">★★★★★★</span>
            <span className="hidden sm:inline">6 SAO (ELITE)</span>
          </span>
        );
      case 5:
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-black bg-gradient-to-r from-amber-500 to-yellow-600 text-slate-950 border border-yellow-300 shadow-md">
            <span className="tracking-tight text-slate-950 font-serif">★★★★★</span>
            <span className="hidden sm:inline">5 SAO (PRO)</span>
          </span>
        );
      case 4:
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-black bg-[#1f1207] text-[#ffd875] border border-amber-500 shadow-md">
            <span className="tracking-tight text-amber-400 font-serif">★★★★</span>
            <span className="hidden sm:inline">4 SAO</span>
          </span>
        );
      case 3:
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#140e08] text-[#ffd875] border border-amber-600/70 shadow">
            <span className="tracking-tight text-amber-400 font-serif">★★★</span>
            <span className="hidden sm:inline">3 SAO</span>
          </span>
        );
      case 2:
        return (
          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-bold bg-[#120c06] text-[#e8c87c] border border-amber-700/60 shadow">
            <span className="tracking-tight text-amber-400 font-serif">★★</span>
            <span className="hidden sm:inline">2 SAO</span>
          </span>
        );
      case 1:
        return (
          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-[#0f0a05] text-[#d4b470] border border-amber-800/50 shadow">
            <span className="text-amber-400 font-serif">★</span>
            <span className="hidden sm:inline">1 SAO</span>
          </span>
        );
      case 0:
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-medium bg-[#140c06] text-[#a68a56] border border-[#472d16]">
            <span className="text-zinc-400 text-xs">☆</span>
            <span>0 SAO (CHƯA XÁC THỰC)</span>
          </span>
        );
    }
  };

  const renderRoleBadge = (role: string) => {
    switch (role) {
      case 'Giảng viên':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-bold bg-[#8b6b23]/30 text-[#f5d77f] border border-[#a8822d]">
            <GraduationCap className="w-3 h-3" />
            Giảng viên
          </span>
        );
      case 'Biên tập':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-bold bg-blue-900/40 text-blue-300 border border-blue-600">
            <Award className="w-3 h-3" />
            Biên tập viên
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold bg-emerald-950/50 text-emerald-300 border border-emerald-700">
            <Users className="w-3 h-3" />
            Học viên
          </span>
        );
    }
  };

  const renderWolfBadge = (level?: number, title?: string) => {
    const lvl = level || 1;
    switch (lvl) {
      case 4:
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-black bg-gradient-to-r from-amber-400 to-[#b8933b] text-slate-950 border border-amber-300 shadow">
            <span>👑</span>
            <span>{title || 'Sói Đầu Đàn'}</span>
          </span>
        );
      case 3:
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-black bg-gradient-to-r from-blue-600 to-indigo-800 text-white border border-blue-400 shadow">
            <span>⚔️</span>
            <span>{title || 'Sói Thực Chiến'}</span>
          </span>
        );
      case 2:
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-gradient-to-r from-emerald-600 to-teal-800 text-white border border-emerald-400 shadow">
            <span>🐺</span>
            <span>{title || 'Sói Tập Sự'}</span>
          </span>
        );
      case 1:
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#291a0c] text-[#ffd875] border border-[#784f1f] shadow">
            <span>🐣</span>
            <span>{title || 'Gà Mới'}</span>
          </span>
        );
    }
  };

  // Render logo theo lựa chọn của người dùng
  const renderCurrentLogo = () => {
    switch (logoStyle) {
      case 'gold-redesign':
        return (
          <img
            src="/assets/forum/logo_variant1_gold.jpg"
            alt="Chơi Poker Logo 24K Gold Redesign"
            className="max-h-24 sm:max-h-28 w-auto mx-auto rounded-lg shadow-2xl object-contain border border-[#b8933b]"
          />
        );
      case 'chrome-redesign':
        return (
          <img
            src="/assets/forum/logo_variant2_chrome.jpg"
            alt="Chơi Poker Logo Championship Chrome Redesign"
            className="max-h-24 sm:max-h-28 w-auto mx-auto rounded-lg shadow-2xl object-contain border border-slate-500"
          />
        );
      case 'user-sketch':
        return (
          <img
            src="/assets/forum/logo_original_user.png"
            alt="Chơi Poker Logo Bản Gốc Của Bạn"
            className="max-h-24 sm:max-h-28 w-auto mx-auto object-contain filter drop-shadow-[0_2px_10px_rgba(0,0,0,0.9)]"
          />
        );
      case 'classic-forumvi':
      default:
        return (
          <img
            src="/assets/forum/logo14.jpg"
            alt="Chúng tôi chơi Poker - Học Poker"
            className="max-h-24 sm:max-h-28 w-auto mx-auto rounded shadow-lg object-contain border border-[#4a3219]"
          />
        );
    }
  };

  const filteredThreads = threads;

  return (
    <div className="min-h-screen text-[#d1ba88] flex flex-col font-sans selection:bg-[#8b6b23]/40">
      {/* ========================================================
          KHUNG DIỄN ĐÀN CHÍNH (#ipbwrapper - BỐ CỤC CHUẨN FORUMVI)
      ======================================================== */}
      <div className="max-w-[1080px] w-full mx-auto px-2 sm:px-4 py-3 flex-1 flex flex-col space-y-3">
        {/* KHU_VỰC_HEADER_BANNER CHÍNH THỨC */}
        <div className="bg-[#080604] border border-[#4a3216] rounded-xl px-4 py-3.5 sm:px-6 sm:py-4 shadow-2xl relative overflow-hidden">
          {/* Dòng tiêu đề phía trên (Không có đuôi tên miền) */}
          <div className="text-center mb-3 pb-2 border-b border-[#3a2610]/80">
            <h1 className="text-xs sm:text-sm md:text-base font-black tracking-[0.18em] text-[#ffd875] uppercase drop-shadow-[0_2px_6px_rgba(255,216,117,0.35)]">
              CHIA SẺ KIẾN THỨC LIÊN QUAN TỚI POKER
            </h1>
          </div>

          {/* Nội dung chính của Banner: Bên trái là Logo gốc không khung hộp, Bên phải là 3 Huy hiệu phân khu nối bằng đường mạch ánh sáng vàng kim */}
          <div className="flex flex-col lg:flex-row items-center justify-between gap-4 lg:gap-6">
            {/* 1. Logo gốc: bàn tay đeo găng đen kẹp lá bài Nhép cùng chữ "Chơi Poker" vàng kim (Không thêm khung hộp) */}
            <a
              href="/"
              onClick={(e) => {
                e.preventDefault();
                handleCloseThread();
              }}
              className="shrink-0 hover:opacity-95 transition-opacity cursor-pointer"
              title="Chơi Poker - Chia sẻ kiến thức liên quan tới Poker"
            >
              <img
                src="/assets/forum/logo_variant1_gold.jpg"
                alt="Chơi Poker"
                className="h-20 sm:h-24 md:h-28 w-auto object-contain select-none"
              />
            </a>

            {/* Đường mạch ánh sáng vàng kim nối từ Logo sang hệ thống 3 Huy hiệu phân khu (hiển thị trên màn hình lớn) */}
            <div className="hidden xl:flex items-center flex-1 min-w-[24px] max-w-[64px]">
              <div className="w-2 h-2 rounded-full bg-[#ffd875] shadow-[0_0_8px_#ffd875]" />
              <div className="flex-1 h-[2px] bg-gradient-to-r from-[#ffd875] via-[#ffe8a3] to-[#ffd875] shadow-[0_0_10px_#ffd875]" />
              <div className="w-2 h-2 rounded-full bg-[#ffd875] shadow-[0_0_8px_#ffd875]" />
            </div>

            {/* 4 & 5. Cụm 3 Huy Hiệu Phân Khu bên phải được liên kết bằng đường mạch ánh sáng vàng kim chạy ngang đồng điệu */}
            <div className="relative flex flex-col sm:flex-row items-center justify-center lg:justify-end gap-2 sm:gap-0 w-full lg:w-auto">
              {/* HUY HIỆU 1: TINH HOA THẾ GIỚI (Quả địa cầu & Chip Poker) */}
              <button
                type="button"
                onClick={() => {
                  handleCloseThread();
                  setSelectedSection('tong-hop-dien-dan');
                  setSelectedCategory('all');
                  scrollToForumBoard('smooth');
                }}
                className="group relative z-10 flex flex-col items-center px-3 py-2 rounded-xl bg-gradient-to-b from-[#1a1107] to-[#0d0804] border border-[#c89d42]/80 hover:border-[#ffd875] shadow-[0_0_15px_rgba(200,157,66,0.2)] hover:shadow-[0_0_22px_rgba(255,216,117,0.45)] transition-all cursor-pointer min-w-[155px]"
              >
                <div className="flex items-center justify-center h-11">
                  {/* Biểu tượng Quả địa cầu vàng kim + Chip Poker */}
                  <svg viewBox="0 0 80 48" className="w-16 h-10 overflow-visible">
                    <defs>
                      <linearGradient id="goldGrad1" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#fff0b8" />
                        <stop offset="50%" stopColor="#ffd875" />
                        <stop offset="100%" stopColor="#9c721c" />
                      </linearGradient>
                    </defs>
                    {/* Quả địa cầu */}
                    <circle cx="28" cy="24" r="15" fill="#0d192b" stroke="url(#goldGrad1)" strokeWidth="2" />
                    <ellipse cx="28" cy="24" rx="8" ry="15" fill="none" stroke="url(#goldGrad1)" strokeWidth="1.3" />
                    <line x1="13" y1="24" x2="43" y2="24" stroke="url(#goldGrad1)" strokeWidth="1.3" />
                    <path d="M16 17 Q28 21 40 17" fill="none" stroke="url(#goldGrad1)" strokeWidth="1.1" />
                    <path d="M16 31 Q28 27 40 31" fill="none" stroke="url(#goldGrad1)" strokeWidth="1.1" />
                    {/* Chip Poker lồng bên phải quả địa cầu */}
                    <circle cx="52" cy="26" r="13" fill="#170e05" stroke="url(#goldGrad1)" strokeWidth="2.2" strokeDasharray="4 2.5" />
                    <circle cx="52" cy="26" r="9" fill="#241508" stroke="url(#goldGrad1)" strokeWidth="1.2" />
                    <text x="52" y="30" textAnchor="middle" fill="#ffd875" fontSize="11" fontWeight="bold">♣</text>
                  </svg>
                </div>
                <span className="mt-1 text-[11px] font-black tracking-wider text-[#ffd875] uppercase group-hover:text-white transition-colors">
                  TINH HOA THẾ GIỚI
                </span>
              </button>

              {/* Đường mạch ánh sáng vàng kim chạy ngang nối Huy hiệu 1 -> Huy hiệu 2 */}
              <div className="hidden sm:flex items-center w-6 md:w-8 shrink-0">
                <div className="w-1.5 h-1.5 rounded-full bg-[#ffd875] shadow-[0_0_8px_#ffd875]" />
                <div className="flex-1 h-[2px] bg-gradient-to-r from-[#ffd875] via-[#fff2c2] to-[#ffd875] shadow-[0_0_12px_#ffd875]" />
                <div className="w-1.5 h-1.5 rounded-full bg-[#ffd875] shadow-[0_0_8px_#ffd875]" />
              </div>

              {/* HUY HIỆU 2: AI TRỌNG TÀI (Cán cân công lý & Chip AI) */}
              <button
                type="button"
                onClick={() => {
                  handleCloseThread();
                  setSelectedSection('trao-doi-chinh');
                  setSelectedCategory('all');
                  scrollToForumBoard('smooth');
                }}
                className="group relative z-10 flex flex-col items-center px-3 py-2 rounded-xl bg-gradient-to-b from-[#1a1107] to-[#0d0804] border border-[#c89d42]/80 hover:border-[#ffd875] shadow-[0_0_15px_rgba(200,157,66,0.2)] hover:shadow-[0_0_22px_rgba(255,216,117,0.45)] transition-all cursor-pointer min-w-[145px]"
              >
                <div className="flex items-center justify-center h-11">
                  {/* Biểu tượng Cán cân công lý + Chip vi mạch AI */}
                  <svg viewBox="0 0 84 48" className="w-16 h-10 overflow-visible">
                    {/* Cán cân công lý bên trái */}
                    <line x1="25" y1="9" x2="25" y2="39" stroke="url(#goldGrad1)" strokeWidth="2.2" />
                    <line x1="17" y1="39" x2="33" y2="39" stroke="url(#goldGrad1)" strokeWidth="2.2" />
                    <line x1="12" y1="15" x2="38" y2="15" stroke="url(#goldGrad1)" strokeWidth="2" />
                    <polygon points="25,6 22,11 28,11" fill="#ffd875" />
                    {/* Đĩa cân trái */}
                    <line x1="13" y1="15" x2="10" y2="26" stroke="#ffd875" strokeWidth="1.2" />
                    <line x1="13" y1="15" x2="16" y2="26" stroke="#ffd875" strokeWidth="1.2" />
                    <path d="M8 26 Q13 31 18 26 Z" fill="url(#goldGrad1)" />
                    {/* Đĩa cân phải */}
                    <line x1="37" y1="15" x2="34" y2="26" stroke="#ffd875" strokeWidth="1.2" />
                    <line x1="37" y1="15" x2="40" y2="26" stroke="#ffd875" strokeWidth="1.2" />
                    <path d="M32 26 Q37 31 42 26 Z" fill="url(#goldGrad1)" />
                    {/* Chip AI bên phải */}
                    <rect x="49" y="13" width="22" height="22" rx="4" fill="#121e16" stroke="url(#goldGrad1)" strokeWidth="2" />
                    {/* Chân mạch Chip AI */}
                    <line x1="54" y1="9" x2="54" y2="13" stroke="#ffd875" strokeWidth="1.6" />
                    <line x1="60" y1="9" x2="60" y2="13" stroke="#ffd875" strokeWidth="1.6" />
                    <line x1="66" y1="9" x2="66" y2="13" stroke="#ffd875" strokeWidth="1.6" />
                    <line x1="54" y1="35" x2="54" y2="39" stroke="#ffd875" strokeWidth="1.6" />
                    <line x1="60" y1="35" x2="60" y2="39" stroke="#ffd875" strokeWidth="1.6" />
                    <line x1="66" y1="35" x2="66" y2="39" stroke="#ffd875" strokeWidth="1.6" />
                    <line x1="71" y1="19" x2="75" y2="19" stroke="#ffd875" strokeWidth="1.6" />
                    <line x1="71" y1="25" x2="75" y2="25" stroke="#ffd875" strokeWidth="1.6" />
                    <line x1="71" y1="31" x2="75" y2="31" stroke="#ffd875" strokeWidth="1.6" />
                    <text x="60" y="28" textAnchor="middle" fill="#ffd875" fontSize="9.5" fontWeight="900">AI</text>
                  </svg>
                </div>
                <span className="mt-1 text-[11px] font-black tracking-wider text-[#ffd875] uppercase group-hover:text-white transition-colors">
                  AI TRỌNG TÀI
                </span>
              </button>

              {/* Đường mạch ánh sáng vàng kim chạy ngang nối Huy hiệu 2 -> Huy hiệu 3 */}
              <div className="hidden sm:flex items-center w-6 md:w-8 shrink-0">
                <div className="w-1.5 h-1.5 rounded-full bg-[#ffd875] shadow-[0_0_8px_#ffd875]" />
                <div className="flex-1 h-[2px] bg-gradient-to-r from-[#ffd875] via-[#fff2c2] to-[#ffd875] shadow-[0_0_12px_#ffd875]" />
                <div className="w-1.5 h-1.5 rounded-full bg-[#ffd875] shadow-[0_0_8px_#ffd875]" />
              </div>

              {/* HUY HIỆU 3: LÒ LUYỆN GÀ HÓA SÓI (Quả trứng vàng -> Trứng nứt nở ra chú gà con -> Đầu sói săn mồi uy lực) */}
              <button
                type="button"
                onClick={() => {
                  handleCloseThread();
                  setSelectedSection('giang-day-nghien-cuu');
                  setSelectedCategory('all');
                  scrollToForumBoard('smooth');
                }}
                className="group relative z-10 flex flex-col items-center px-3.5 py-2 rounded-xl bg-gradient-to-b from-[#1a1107] to-[#0d0804] border border-[#c89d42]/80 hover:border-[#ffd875] shadow-[0_0_15px_rgba(200,157,66,0.2)] hover:shadow-[0_0_22px_rgba(255,216,117,0.45)] transition-all cursor-pointer min-w-[195px]"
              >
                <div className="flex items-center justify-center h-11">
                  {/* Tiến trình lột xác trực quan: Quả trứng vàng -> Trứng nứt nở ra chú gà con -> Đầu sói săn mồi uy lực */}
                  <svg viewBox="0 0 138 48" className="w-32 h-10 overflow-visible">
                    {/* Bước 1: Quả trứng vàng */}
                    <path
                      d="M18 11 C11 11 8 22 8 30 C8 37 12 41 18 41 C24 41 28 37 28 30 C28 22 25 11 18 11 Z"
                      fill="url(#goldGrad1)"
                      stroke="#fff3c4"
                      strokeWidth="1.2"
                    />
                    {/* Mũi tên mạch vàng 1 */}
                    <line x1="31" y1="26" x2="41" y2="26" stroke="#ffd875" strokeWidth="1.8" />
                    <polygon points="43,26 39,23 39,29" fill="#ffd875" />

                    {/* Bước 2: Trứng nứt nở ra chú gà con */}
                    {/* Thân và đầu chú gà con */}
                    <circle cx="59" cy="19" r="7.5" fill="#ffe066" stroke="#b8860b" strokeWidth="1.2" />
                    <circle cx="57.5" cy="17.5" r="1.3" fill="#140c06" />
                    <polygon points="66,18 71,20 66,22" fill="#ff9f1c" />
                    {/* Nửa vỏ trứng vàng nứt bên dưới */}
                    <path
                      d="M48 25 L53 29 L57 24 L61 29 L65 24 L70 26 C70 36 65 41 59 41 C53 41 48 36 48 25 Z"
                      fill="url(#goldGrad1)"
                      stroke="#fff3c4"
                      strokeWidth="1.2"
                    />

                    {/* Mũi tên mạch vàng 2 */}
                    <line x1="74" y1="26" x2="84" y2="26" stroke="#ffd875" strokeWidth="1.8" />
                    <polygon points="86,26 82,23 82,29" fill="#ffd875" />

                    {/* Bước 3: Đầu sói săn mồi uy lực */}
                    <g transform="translate(88, 5)">
                      {/* Tai & bờm sói */}
                      <polygon
                        points="7,16 11,2 20,11 30,11 39,2 43,16 47,26 38,35 25,40 12,35 3,26"
                        fill="#1c1208"
                        stroke="url(#goldGrad1)"
                        strokeWidth="2"
                      />
                      {/* Chi tiết bờm & sống mũi sắc bén */}
                      <polygon points="25,11 19,27 25,35 31,27" fill="url(#goldGrad1)" opacity="0.28" />
                      {/* Đôi mắt sói sáng rực uy lực */}
                      <polygon points="13,20 21,23 15,25" fill="#ffd875" />
                      <polygon points="37,20 29,23 35,25" fill="#ffd875" />
                      {/* Mũi & nanh sói */}
                      <polygon points="22,32 28,32 25,36" fill="#ffd875" />
                    </g>
                  </svg>
                </div>
                <span className="mt-1 text-[11px] font-black tracking-wider text-[#ffd875] uppercase group-hover:text-white transition-colors">
                  LÒ LUYỆN GÀ HÓA SÓI
                </span>
              </button>
            </div>
          </div>
        </div>

        {/* THANH MENU ĐIỀU HƯỚNG (#submenu) */}
        <div className="menu-container nav-bar bg-gradient-to-r from-[#1c1007] via-[#2d1b0d] to-[#1c1007] border border-[#472d16] rounded-xl px-4 py-2 flex flex-wrap items-center justify-between text-xs shadow-md">
          <div className="flex flex-wrap items-center gap-2 sm:gap-4 font-semibold text-[#f0d8a8]">
            <button
              onClick={() => {
                handleCloseThread();
                setSelectedCategory('all');
              }}
              className="menu-item nav-button hover:text-amber-300 transition-colors cursor-pointer flex items-center gap-1 py-1"
            >
              <BookOpen className="w-3.5 h-3.5 text-[#d4a849]" />
              <span>Trang Chính</span>
            </button>
            <span className="text-[#59391b]">•</span>
            <button
              onClick={() => {
                handleCloseThread();
                setSelectedCategory('nhap-mon');
              }}
              className="menu-item nav-button hover:text-amber-300 transition-colors cursor-pointer py-1"
            >
              Luật Chơi Texas Hold'em
            </button>
            <span className="text-[#59391b]">•</span>
            <button
              onClick={() => {
                handleCloseThread();
                setSelectedCategory('all');
              }}
              className="menu-item nav-button hover:text-amber-300 transition-colors cursor-pointer py-1"
            >
              Thảo luận mới (365 ngày)
            </button>
            <span className="text-[#59391b]">•</span>
            <button
              onClick={() => setShowAiModal(true)}
              className="menu-item nav-button px-2.5 py-0.5 rounded-full bg-[#8b6b23]/30 border border-[#b8933b]/60 text-[#fcedaf] hover:bg-[#8b6b23]/50 transition-colors flex items-center gap-1 cursor-pointer"
            >
              <Bot className="w-3.5 h-3.5 text-amber-300 animate-pulse" />
              <span>Hỏi Cố Vấn AI</span>
            </button>
          </div>

          <div className="flex items-center space-x-2 mt-2 sm:mt-0">
            {currentUser ? (
              <div className="flex items-center space-x-2 bg-[#120a04] border border-[#3b2310] px-3 py-1 rounded-lg">
                {currentUser.avatar.startsWith('/') ? (
                  <img
                    src={currentUser.avatar}
                    alt={currentUser.username}
                    className="w-5 h-5 rounded-full object-cover border border-[#b8933b]"
                  />
                ) : (
                  <div className={`w-5 h-5 rounded-full ${currentUser.avatar} flex items-center justify-center text-[10px] text-black font-bold`}>
                    {currentUser.username[0]}
                  </div>
                )}
                <span
                  onClick={() => setShowProfileModal(true)}
                  className="font-bold text-[#f5dfb0] hover:text-[#ffd875] cursor-pointer transition-colors"
                  title="Nhấn để mở Hồ Sơ VĐV & Xác Thực"
                >
                  {currentUser.username}
                </span>
                <div onClick={() => setShowProfileModal(true)} className="cursor-pointer" title="Cấp bậc VĐV / Nhóm đặc biệt - Nhấn để xem hồ sơ">
                  {renderUserRankBadge(currentUser)}
                </div>
                <button
                  onClick={() => setShowProfileModal(true)}
                  className="px-2 py-0.5 rounded text-[11px] font-bold bg-[#29170a] hover:bg-[#3d2310] border border-[#784f1f] text-[#ffd875] flex items-center gap-1 cursor-pointer transition shadow"
                  title="Mở Hồ Sơ Vận Động Viên & Xác Thực 4 Cổng Dữ Liệu"
                >
                  <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
                  <span className="hidden sm:inline">Hồ Sơ & Xác Thực</span>
                </button>
                <div
                  onClick={() => setShowAuthModal(true)}
                  className="cursor-pointer hover:opacity-90 transition-opacity"
                  title="Hạng Sói Học Viện - Nhấn để đổi tài khoản"
                >
                  {renderWolfBadge(currentUser.wolfLevel, currentUser.wolfTitle)}
                </div>
                <button
                  onClick={handleLogout}
                  className="p-1 text-[#8c6b45] hover:text-rose-400 transition-colors cursor-pointer"
                  title="Đăng xuất"
                >
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <button
                onClick={() => {
                  setAuthMode('login');
                  setShowAuthModal(true);
                }}
                className="px-3.5 py-1.5 rounded-lg bg-gradient-to-r from-[#ffd875] to-[#8b6b23] hover:from-[#ffe299] hover:to-[#a6822e] text-slate-950 font-black text-xs transition-all cursor-pointer shadow-md flex items-center gap-1.5"
              >
                <Users className="w-3.5 h-3.5 text-black" />
                <span>Đăng Ký / Đăng Nhập</span>
              </button>
            )}
          </div>
        </div>


        {/* KHUNG THÔNG BÁO CHẠY CHỮ TICKER (#fa_ticker_block) */}
        <div className="bg-[#170e08]/95 border-2 border-[#54361b] rounded-xl p-3 shadow-inner">
          <div className="flex items-start space-x-3 text-xs">
            <span className="px-2 py-0.5 bg-[#8b6b23] text-black font-black rounded text-[10px] uppercase tracking-wider shrink-0 mt-0.5">
              THÔNG BÁO TỪ DIỄN ĐÀN
            </span>
            <div className="space-y-0.5 text-[#e6cb9c] font-medium leading-relaxed">
              <p>...Nếu bạn chỉ muốn biết thế nào là Poker, hãy hỏi GOOGLE....</p>
              <p>...Nếu bạn muốn học chơi, hãy đăng ký thành viên...</p>
              <p className="text-[#ffd875] font-bold">...Nếu bạn muốn kiếm tiền từ Poker, hãy liên hệ với chúng tôi...</p>
            </div>
          </div>
        </div>

        {/* THANH ĐIỀU HƯỚNG BREADCRUMB */}
        <div
          id="thread-content-top"
          className="bg-[#191009]/90 border border-[#382312] px-4 py-2 rounded-lg text-xs flex items-center justify-between text-[#b39562] scroll-mt-3"
        >
          <div className="flex items-center space-x-1.5 flex-wrap">
            <span
              onClick={() => handleCloseThread()}
              className="text-[#f0d8a8] hover:underline cursor-pointer font-bold"
            >
              Học Poker
            </span>
            <span>&gt;</span>
            {activeThread ? (
              <>
                <span
                  onClick={() => {
                    handleCloseThread();
                    setSelectedSection(activeThread.mainSection);
                    setSelectedCategory('all');
                  }}
                  className="text-[#f0d8a8] hover:underline cursor-pointer font-semibold"
                >
                  {activeThread.mainSectionName}
                </span>
                <span>&gt;</span>
                <span
                  onClick={() => {
                    handleCloseThread();
                    setSelectedCategory(activeThread.category);
                  }}
                  className="text-[#e6cb9c] hover:underline cursor-pointer"
                >
                  {activeThread.subForum}
                </span>
                <span>&gt;</span>
                <span className="text-[#ffd875] font-semibold truncate max-w-sm">
                  {activeThread.title}
                </span>
              </>
            ) : (
              <span className="text-[#ffd875]">Diễn đàn Chơi Poker</span>
            )}
          </div>

          {activeThread && (
            <div className="flex items-center gap-2 shrink-0">
              <div className="relative">
                <button
                  onClick={handleShareThread}
                  className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded bg-[#2e190c] hover:bg-[#452714] border border-[#633e1c] text-[#ffd875] text-xs font-semibold cursor-pointer"
                  title="Sao chép link kèm tiêu đề và tóm tắt bài viết"
                >
                  {shareToast ? <Check className="w-3 h-3 text-emerald-400" /> : <Share2 className="w-3 h-3 text-amber-400" />}
                  <span>{shareToast ? 'Đã chép link!' : 'Chia sẻ'}</span>
                </button>
              </div>
              <button
                onClick={() => handleCloseThread()}
                className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded bg-[#29170a] hover:bg-[#3b220f] border border-[#4d2f16] text-[#e0c48e] text-xs font-semibold cursor-pointer"
              >
                <ArrowLeft className="w-3 h-3" />
                <span>Quay lại</span>
              </button>
            </div>
          )}
        </div>

        {/* ========================================================
            XEM CHI TIẾT BÀI ĐĂNG (FORUM TOPIC VIEW - HIỆN NGAY NỘI DUNG)
        ======================================================== */}
        {activeThread ? (
          <div className="space-y-4">
            {/* Bài Đăng Đầu Tiên (Post #1 - Hiện trực tiếp nội dung ngay khi click vào tiêu đề) */}
            <div
              id="thread-post-start"
              className="border border-[#3d2712] rounded-xl overflow-hidden shadow-2xl bg-[#140c06] flex flex-col md:flex-row scroll-mt-1"
            >
              {/* Cột Thông Tin Tác Giả */}
              <div className="w-full md:w-56 bg-[#1a1008] p-4 border-b md:border-b-0 md:border-r border-[#382312] flex flex-col items-center text-center space-y-2">
                {activeThread.author === 'Tidu' ? (
                  <img
                    src="/assets/forum/avatar_tidu.jpg"
                    alt="Tidu Avatar"
                    className="w-20 h-20 rounded-xl object-cover border-2 border-[#b8933b] shadow-md"
                  />
                ) : (
                  <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-[#8b6b23] to-[#45330e] flex items-center justify-center text-2xl font-black text-black shadow-md">
                    {activeThread.author[0]}
                  </div>
                )}
                <div className="font-bold text-sm text-[#fce8ba]">{activeThread.author}</div>
                <div className="flex flex-col items-center gap-1.5">
                  {renderUserRankBadge({
                    username: activeThread.author,
                    role: activeThread.authorRole,
                    roleGroup: activeThread.author === 'Tidu' ? 'special' : 'athlete',
                    specialRole: activeThread.author === 'Tidu' ? 'coach' : undefined,
                    starLevel: activeThread.author === 'Tidu' ? undefined : (activeThread.authorRole === 'Biên tập' ? 4 : 2)
                  })}
                  {renderWolfBadge(activeThread.author === 'Tidu' ? 4 : (activeThread.authorRole === 'Biên tập' ? 3 : 2))}
                </div>

                <div className="w-full pt-3 mt-1 border-t border-[#36210f] text-[11px] text-[#a68a56] space-y-1 text-left">
                  <div className="flex justify-between">
                    <span>Số bài viết:</span>
                    <strong className="text-[#fce8ba]">{activeThread.authorPosts}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span>Ngày tham gia:</span>
                    <strong className="text-[#fce8ba]">{activeThread.authorJoinDate}</strong>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Trạng thái:</span>
                    <span className="text-emerald-400 font-bold flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                      Trực tuyến
                    </span>
                  </div>
                </div>
              </div>

              {/* Thân Bài Đăng */}
              <div className="flex-1 p-5 sm:p-6 space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#382312] pb-2.5 text-xs text-[#a68a56]">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleCloseThread()}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#29170a] hover:bg-[#3b220f] border border-[#5c3618] text-[#ffd875] text-xs font-bold cursor-pointer shrink-0"
                    >
                      <ArrowLeft className="w-3.5 h-3.5" />
                      <span>Quay lại</span>
                    </button>
                    <span className="font-semibold text-[#e6cb9c] line-clamp-1">{activeThread.title}</span>
                  </div>
                  <div className="flex items-center gap-2 shrink-0 flex-wrap">
                    {adTopicSession && activeLang !== nativeLang && !hasActiveSubscription() && adRemainingSec > 0 && (
                      <span className="px-2 py-0.5 rounded bg-emerald-950/90 border border-emerald-600/60 text-emerald-300 text-[10px] font-bold">
                        ⏱️ Bản dịch 1 chủ đề: còn {Math.floor(adRemainingSec / 60)}:{String(adRemainingSec % 60).padStart(2, '0')}
                      </span>
                    )}
                    <select
                      value={activeLang}
                      onChange={(e) => handleSelectLanguage(e.target.value)}
                      className="bg-[#1c1008] text-[#ffd875] font-bold text-[11px] rounded px-2 py-0.5 border border-[#54361b] focus:outline-none cursor-pointer"
                    >
                      {SUPPORTED_LANGUAGES.map((lang) => {
                        const isNative = lang.code === nativeLang;
                        const unlocked = isLanguageUnlockedForCurrentTopic(lang.code, nativeLang, activeThread.id);
                        return (
                          <option key={lang.code} value={lang.code} className="bg-[#140b05] text-[#fce8ba]">
                            {lang.flag} {lang.label} {isNative ? '(Ngôn ngữ của bạn)' : unlocked ? '✓' : ''}
                          </option>
                        );
                      })}
                    </select>
                    <span className="text-[#ffd875] font-semibold">{activeThread.publishedAt}</span>
                  </div>
                </div>

                {/* NẾU BÀI HỌC GIÁO TRÌNH CHƯA MỞ KHÓA -> HIỂN THỊ MÀN HÌNH KHÓA */}
                {activeThread.quizChallenge && (currentUser?.wolfLevel || 1) < activeThread.quizChallenge.level ? (
                  <div className="my-6 p-6 sm:p-8 rounded-2xl bg-gradient-to-r from-[#1c0f05] via-[#2d1808] to-[#1c0f05] border-2 border-amber-600/80 shadow-2xl text-center space-y-4 animate-fade-in">
                    <div className="w-16 h-16 rounded-full bg-amber-950/80 border-2 border-amber-500 text-amber-400 flex items-center justify-center mx-auto text-3xl shadow-lg">
                      <Lock className="w-8 h-8" />
                    </div>
                    <div className="space-y-1.5">
                      <span className="px-3 py-1 rounded-full bg-amber-950 text-amber-300 border border-amber-600 text-xs font-black uppercase tracking-wider inline-flex items-center gap-1.5">
                        <Lock className="w-3.5 h-3.5 text-amber-400" />
                        BÀI HỌC SĂN MỒI ĐANG BỊ KHÓA
                      </span>
                      <h3 className="text-xl font-black text-[#ffd875]">
                        Yêu Cầu Cấp Độ {activeThread.quizChallenge.level}: {activeThread.quizChallenge.levelName}
                      </h3>
                      <p className="text-xs text-[#d1ba88] max-w-md mx-auto leading-relaxed">
                        Cấp bậc hiện tại của bạn: <strong>{currentUser?.wolfTitle || 'Gà Mới Nhập Đàn'}</strong> (Cấp {currentUser?.wolfLevel || 1}/4).
                        <br />
                        Theo quy chuẩn <em>"Từ Gà Hóa Sói"</em> của CLB, bạn bắt buộc phải vượt qua bài kiểm tra tình huống thực tế của Cấp {activeThread.quizChallenge.level - 1} để được mở khóa bài học này!
                      </p>
                    </div>

                    <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
                      <button
                        onClick={() => {
                          const prevLessonId = activeThread.quizChallenge?.level === 2 ? 'bai-viet-clb-00' : activeThread.quizChallenge?.level === 3 ? 'bai-viet-clb-01' : 'bai-viet-clb-02';
                          handleOpenCurriculum(prevLessonId);
                        }}
                        className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#ffd875] to-[#8b6b23] text-slate-950 font-black text-xs hover:scale-105 transition-all shadow-lg flex items-center gap-2 cursor-pointer"
                      >
                        <span>🎯 Làm Bài Kiểm Tra Cấp {activeThread.quizChallenge.level - 1} Để Mở Khóa</span>
                        <span>&rarr;</span>
                      </button>
                      <button
                        onClick={handleCloseThread}
                        className="px-4 py-2.5 rounded-xl bg-[#2b170a] hover:bg-[#3d210e] text-[#d1ba88] text-xs font-bold border border-[#5c3417] cursor-pointer"
                      >
                        Quay Lại Diễn Đàn
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                {/* Banner chuyên mục nếu là bài của Tidu */}
                {activeThread.id === 'bai-viet-00' && (
                  <div className="my-2 text-center">
                    <img
                      src="/assets/forum/wall1015.png"
                      alt="Poker là gì - Texas Hold'em"
                      className="max-h-72 w-auto mx-auto rounded-lg border border-[#523317] shadow-lg object-contain"
                    />
                  </div>
                )}

                {/* Hộp Đọc / Tải File PDF Giáo Trình Gốc */}
                {activeThread.pdfUrl && (
                  <div className="my-3 p-4 rounded-xl bg-[#1f1107] border-2 border-[#b8933b] shadow-xl flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="flex items-center space-x-3 w-full sm:w-auto">
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-red-600 to-rose-800 text-white font-black flex items-center justify-center text-xs shadow-md shrink-0 border border-rose-400">
                        PDF
                      </div>
                      <div className="space-y-0.5">
                        <div className="text-sm font-bold text-[#ffd875] flex items-center gap-1.5 flex-wrap">
                          <span>Giáo Trình Bản Gốc: "POKER - LUẬT CHƠI 2016"</span>
                          <span className="px-1.5 py-0.5 bg-emerald-950 text-emerald-300 border border-emerald-700 rounded text-[10px] font-bold">
                            Chính chủ Tidu
                          </span>
                        </div>
                        <p className="text-xs text-[#d1ba88]">
                          Tài liệu 16 trang chuẩn • Dung lượng 1.8MB • Có thể đọc trực tiếp hoặc mở Google Drive
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 w-full sm:w-auto justify-end shrink-0">
                      <a
                        href={activeThread.pdfUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1 sm:flex-none px-3.5 py-2 rounded-lg bg-[#8b6b23] hover:bg-[#a6822c] text-slate-950 font-black text-xs flex items-center justify-center gap-1.5 transition shadow cursor-pointer"
                      >
                        <BookOpen className="w-3.5 h-3.5" />
                        <span>Mở / Tải Bản PDF</span>
                      </a>
                      {activeThread.driveLink && (
                        <a
                          href={activeThread.driveLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex-1 sm:flex-none px-3.5 py-2 rounded-lg bg-[#2b180d] hover:bg-[#3d2312] border border-[#5c3719] text-[#ffd875] font-bold text-xs flex items-center justify-center gap-1.5 transition shadow cursor-pointer"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                          <span>Google Drive</span>
                        </a>
                      )}
                    </div>
                  </div>
                )}

                {/* KHUNG HIỂN THỊ TRỰC TIẾP TÀI LIỆU PDF NGUYÊN BẢN */}
                {activeThread.pdfUrl && (
                  <div className="space-y-2 my-4">
                    <div className="flex items-center justify-between text-xs text-[#e6b84d] font-bold uppercase">
                      <span className="flex items-center gap-1.5">
                        <BookOpen className="w-4 h-4" />
                        Đọc trực tiếp sách: "POKER - LUẬT CHƠI 2016" (16 trang đầy đủ)
                      </span>
                      <a
                        href={activeThread.pdfUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[11px] text-[#ffd875] hover:underline flex items-center gap-1 lowercase font-normal"
                      >
                        [mở tab mới xem toàn màn hình]
                      </a>
                    </div>
                    <div className="rounded-xl overflow-hidden border-2 border-[#543317] shadow-2xl bg-[#0f0804]">
                      <iframe
                        src={`${activeThread.pdfUrl}#toolbar=1&navpanes=1`}
                        className="w-full h-[650px] bg-neutral-900"
                        title="Sách Giáo Trình Poker 2016 - Tác giả Tidu"
                      />
                    </div>
                  </div>
                )}

                {/* 1. NỘI DUNG CỦA NGƯỜI VIẾT CHỦ ĐỀ (TÌNH HUỐNG & DIỄN BIẾN VÁN BÀI) */}
                {activeThread.handHistory && (
                  <div className="space-y-1.5">
                    <div className="text-xs font-bold text-[#e6b84d] uppercase flex items-center gap-1">
                      <Layers className="w-3.5 h-3.5" />
                      <span>Nội dung tình huống & diễn biến ván bài của tác giả ({activeThread.author}):</span>
                    </div>
                    <div className="bg-[#0d0703] border border-[#3b2413] rounded-lg p-3.5 font-mono text-xs text-[#e6d0a8] leading-relaxed whitespace-pre-wrap">
                      {activeThread.handHistory}
                    </div>
                  </div>
                )}

                {/* TÓM TẮT NỘI DUNG CHỦ ĐỀ NẾU KHÔNG CÓ HAND HISTORY */}
                {!activeThread.handHistory && activeThread.summary && (
                  <div className="bg-[#120a05] border border-[#382312] rounded-lg p-4 text-xs sm:text-sm text-[#f0dfc0] leading-relaxed whitespace-pre-wrap">
                    {activeThread.summary}
                  </div>
                )}

                {/* THỬ THÁCH THỰC CHIẾN CLB - MỞ KHÓA CẤP ĐỘ SĂN MỒI */}
                {activeThread.quizChallenge && (
                  <div className="my-4 p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-[#1c0f05] via-[#2d1808] to-[#1c0f05] border-2 border-[#ffd875] shadow-2xl space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#523317] pb-3">
                      <div className="flex items-center space-x-2.5">
                        <span className="text-2xl">{activeThread.quizChallenge.levelIcon}</span>
                        <div>
                          <div className="flex items-center space-x-2">
                            <span className="px-2 py-0.5 rounded bg-[#ffd875] text-black font-black text-[10px] uppercase tracking-wider">
                              THỬ THÁCH THỰC CHIẾN CLB
                            </span>
                            <span className="text-xs font-bold text-[#ffd875]">
                              Cấp độ {activeThread.quizChallenge.level}: {activeThread.quizChallenge.levelName}
                            </span>
                          </div>
                          <h4 className="text-sm font-black text-[#fff2cc] mt-0.5">
                            Giải đúng tư duy CLB để mở khóa cấp độ săn mồi tiếp theo!
                          </h4>
                        </div>
                      </div>
                      <span className="text-[11px] text-[#d1ba88] bg-[#3b2310] px-2.5 py-1 rounded-lg border border-[#5c3719] self-start sm:self-auto">
                        Quy chuẩn: Lo-Trinh-Ga-Hoa-Soi
                      </span>
                    </div>

                    <div className="space-y-3">
                      <p className="text-xs sm:text-sm font-bold text-[#fce8ba] leading-relaxed">
                        ❓ {activeThread.quizChallenge.question}
                      </p>

                      <div className="space-y-2">
                        {activeThread.quizChallenge.options.map((opt, oIdx) => (
                          <div
                            key={oIdx}
                            onClick={() => {
                              setSelectedQuizAnswer(oIdx);
                              setQuizResult(null);
                            }}
                            className={`p-3 rounded-xl border text-xs cursor-pointer transition-all flex items-center gap-3 ${
                              selectedQuizAnswer === oIdx
                                ? 'bg-[#3b2310] border-[#ffd875] text-[#ffd875] font-bold shadow-md'
                                : 'bg-[#120a05] border-[#3b2413] text-[#d1ba88] hover:bg-[#1f1209] hover:border-[#5c3719]'
                            }`}
                          >
                            <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black shrink-0 ${
                              selectedQuizAnswer === oIdx
                                ? 'bg-[#ffd875] text-black'
                                : 'bg-[#24160b] text-[#8c6b45] border border-[#3d2411]'
                            }`}>
                              {String.fromCharCode(65 + oIdx)}
                            </span>
                            <span>{opt}</span>
                          </div>
                        ))}
                      </div>

                      <div className="flex items-center justify-between pt-2">
                        <button
                          onClick={handleSolveQuiz}
                          disabled={selectedQuizAnswer === null}
                          className="px-5 py-2 rounded-xl bg-gradient-to-r from-[#ffd875] to-[#8b6b23] hover:from-[#ffe299] hover:to-[#a6822e] text-slate-950 font-black text-xs transition-all shadow-lg disabled:opacity-50 cursor-pointer flex items-center gap-2"
                        >
                          <Check className="w-4 h-4 text-black" />
                          <span>Gửi Lời Giải & Kiểm Tra Phán Quyết</span>
                        </button>
                      </div>

                      {quizResult === 'correct' && (
                        <div className="p-4 rounded-xl bg-emerald-950/90 border border-emerald-500 text-emerald-200 text-xs space-y-2 animate-fade-in shadow-xl">
                          <div className="font-black text-emerald-300 text-sm flex items-center gap-1.5">
                            <span>🎉 CHÚC MỪNG! BẠN ĐÃ GIẢI ĐÚNG THEO TƯ DUY THỰC CHIẾN CLB!</span>
                          </div>
                          <p className="leading-relaxed">{activeThread.quizChallenge.explanation}</p>
                          <div className="pt-1 text-[11px] font-bold text-[#ffd875]">
                            ★ Bạn đã được thăng hạng và mở khóa cấp độ săn mồi tiếp theo!
                          </div>
                          {activeThread.quizChallenge.level < 4 && (
                            <div className="pt-2 border-t border-emerald-800/60 mt-2 flex items-center justify-between flex-wrap gap-2">
                              <span className="text-[11px] text-emerald-300 font-semibold">
                                Cấp độ tiếp theo đã mở khóa:
                              </span>
                              <button
                                onClick={() => {
                                  const nextIds = ['', 'bai-viet-clb-01', 'bai-viet-clb-02', 'bai-viet-clb-03'];
                                  const currentLvl = activeThread.quizChallenge?.level || 1;
                                  handleOpenCurriculum(nextIds[currentLvl]);
                                }}
                                className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-400 to-teal-500 hover:from-emerald-300 hover:to-teal-400 text-slate-950 font-black text-xs transition-all shadow-lg flex items-center gap-1.5 cursor-pointer"
                              >
                                <span>🚀 Vào Học Bài Cấp {(activeThread.quizChallenge?.level || 1) + 1} Ngay</span>
                                <span>&rarr;</span>
                              </button>
                            </div>
                          )}
                          {activeThread.quizChallenge?.level === 4 && (
                            <div className="pt-2 border-t border-emerald-800/60 text-center text-xs font-black text-[#ffd875]">
                              🏆 XIN CHÚC MỪNG! BẠN ĐÃ ĐẠT ĐẲNG CẤP CAO NHẤT: 👑 SÓI ĐẦU ĐÀN CỦA CLB CHƠI POKER!
                            </div>
                          )}
                        </div>
                      )}

                      {quizResult === 'wrong' && (
                        <div className="p-3.5 rounded-xl bg-rose-950/80 border border-rose-600 text-rose-200 text-xs space-y-1.5 animate-fade-in shadow-xl">
                          <div className="font-black text-rose-300 text-sm flex items-center gap-1.5">
                            <span>❌ LỜI GIẢI CHƯA ĐÚNG - BẠN ĐANG ĐÁNH THEO CẢM TÍNH!</span>
                          </div>
                          <p>
                            Lựa chọn này vi phạm kỷ luật chiến thuật của CLB (dễ rơi vào thế bị động hoặc đốt chip không đáng có). Hãy đọc lại kỹ phần giáo trình và video hướng dẫn phía trên rồi thử chọn lại nhé!
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* 4. KHUNG CÁC BÌNH LUẬN & TRANH LUẬN KHÁC CỦA CÁC PRO QUỐC TẾ (CẦN XEM QC 30S HOẶC GÓI HỘI VIÊN ĐỂ XEM BẢN DỊCH NGÔN NGỮ BẢN ĐỊA) */}
                {activeThread.proInteractions && activeThread.proInteractions.length > 0 && (
                  <div className="my-4 rounded-2xl bg-gradient-to-b from-[#0e1929] via-[#122033] to-[#0c1624] border-2 border-blue-500/80 shadow-2xl p-4 sm:p-5 space-y-4">
                    {/* Header Khung Pro */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-blue-900/60 pb-3">
                      <div className="flex items-center space-x-2.5">
                        <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center font-black shadow-lg shrink-0">
                          <MessageSquare className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <h4 className="text-sm font-black text-[#f0f6ff]">
                            Các Bình Luận & Tranh Luận Khác Của Các Pro ({activeThread.proInteractions.length} bình luận)
                          </h4>
                        </div>
                      </div>

                      {areCommentsUnlockedForTopic(activeThread.id) ? (
                        <span className="text-[11px] text-emerald-300 bg-emerald-950/80 px-3 py-1 rounded-lg border border-emerald-600/60 shrink-0 self-start sm:self-auto font-bold">
                          ✓ Đã dịch sang {SUPPORTED_LANGUAGES.find((l) => l.code === nativeLang)?.label || 'tiếng bản địa'}{' '}
                          {!hasActiveSubscription() && commentsRemainingSec > 0
                            ? `(Còn ${Math.floor(commentsRemainingSec / 60)}:${String(commentsRemainingSec % 60).padStart(2, '0')})`
                            : '(Hội viên VIP)'}
                        </span>
                      ) : (
                        <button
                          type="button"
                          onClick={handleOpenUnlockCommentsModal}
                          className="px-3.5 py-1.5 rounded-lg bg-gradient-to-r from-[#ffd875] to-[#8b6b23] text-slate-950 font-black text-xs shadow-md cursor-pointer hover:scale-[1.02] transition-all shrink-0 self-start sm:self-auto flex items-center gap-1.5"
                        >
                          <Globe2 className="w-3.5 h-3.5 text-black" />
                          <span>
                            Dịch sang {SUPPORTED_LANGUAGES.find((l) => l.code === nativeLang)?.label || 'tiếng bản địa'} của bạn nhé
                          </span>
                        </button>
                      )}
                    </div>

                    {/* Hộp gợi ý nhẹ nhàng bên ngoài (chưa nhắc tới quảng cáo cho tới khi người dùng bấm vào) */}
                    {!areCommentsUnlockedForTopic(activeThread.id) && (
                      <div className="p-3.5 rounded-xl bg-gradient-to-r from-[#1c1006] via-[#2b190a] to-[#1c1006] border border-amber-500/70 shadow-lg flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                        <div className="text-xs text-[#fce8ba] font-medium leading-relaxed">
                          💬 Các bình luận phản biện bên dưới đang hiển thị ở ngôn ngữ gốc quốc tế. Bạn muốn đọc bằng ngôn ngữ của mình chứ?
                        </div>
                        <button
                          type="button"
                          onClick={handleOpenUnlockCommentsModal}
                          className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#ffd875] to-[#8b6b23] hover:from-[#ffe299] hover:to-[#a6822e] text-slate-950 font-black text-xs shadow-lg cursor-pointer shrink-0 whitespace-nowrap flex items-center gap-1.5"
                        >
                          <Globe2 className="w-3.5 h-3.5 text-black" />
                          <span>
                            Dịch sang {SUPPORTED_LANGUAGES.find((l) => l.code === nativeLang)?.label || 'tiếng bản địa'} của bạn nhé
                          </span>
                        </button>
                      </div>
                    )}

                    {/* Bộ Lọc Theo Lập Trường Pro */}
                    <div className="flex items-center gap-1.5 flex-wrap pt-1">
                      <span className="text-[11px] font-bold text-blue-300 mr-1 flex items-center gap-1">
                        <Filter className="w-3.5 h-3.5" />
                        Lọc theo góc nhìn:
                      </span>
                      <button
                        onClick={() => setProStanceFilter('all')}
                        className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                          proStanceFilter === 'all'
                            ? 'bg-blue-600 text-white shadow'
                            : 'bg-[#15253b] text-blue-300 hover:bg-[#1d324f]'
                        }`}
                      >
                        Tất cả ({activeThread.proInteractions.length})
                      </button>
                      <button
                        onClick={() => setProStanceFilter('shove')}
                        className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                          proStanceFilter === 'shove'
                            ? 'bg-rose-700 text-white shadow'
                            : 'bg-[#15253b] text-rose-300 hover:bg-[#1d324f]'
                        }`}
                      >
                        🔥 Tố / Shove All-in
                      </button>
                      <button
                        onClick={() => setProStanceFilter('fold')}
                        className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                          proStanceFilter === 'fold'
                            ? 'bg-emerald-700 text-white shadow'
                            : 'bg-[#15253b] text-emerald-300 hover:bg-[#1d324f]'
                        }`}
                      >
                        🛡️ Bỏ Bài / Fold
                      </button>
                      <button
                        onClick={() => setProStanceFilter('gto')}
                        className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                          proStanceFilter === 'gto'
                            ? 'bg-cyan-700 text-white shadow'
                            : 'bg-[#15253b] text-cyan-300 hover:bg-[#1d324f]'
                        }`}
                      >
                        🧠 Solver GTO
                      </button>
                      <button
                        onClick={() => setProStanceFilter('exploit')}
                        className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                          proStanceFilter === 'exploit'
                            ? 'bg-amber-700 text-white shadow'
                            : 'bg-[#15253b] text-amber-300 hover:bg-[#1d324f]'
                        }`}
                      >
                        🎯 Khai Thác Đối Thủ
                      </button>
                    </div>

                    {/* Danh Sách Các Pro Trả Lời */}
                    <div className="space-y-3 pt-1">
                      {activeThread.proInteractions
                        .filter((p) => proStanceFilter === 'all' || p.stance === proStanceFilter)
                        .map((pro) => (
                          <div
                            key={pro.id}
                            className="p-4 rounded-xl bg-[#09121d] border border-blue-900/70 shadow-lg space-y-2.5 hover:border-blue-500/60 transition-all"
                          >
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#18293d] pb-2">
                              <div className="flex items-center space-x-2.5 flex-wrap">
                                <div className={`w-8 h-8 rounded-full ${pro.proAvatarBg} text-white font-black flex items-center justify-center text-xs shadow shrink-0`}>
                                  {pro.proName.charAt(0)}
                                </div>
                                <div>
                                  <div className="flex items-center space-x-2 flex-wrap">
                                    <span className="font-bold text-sm text-[#f0f6ff]">{pro.proName}</span>
                                  </div>
                                  <span className="text-[11px] text-blue-400/80">{pro.proRole}</span>
                                </div>
                              </div>

                              <div className="flex items-center gap-2 self-start sm:self-auto">
                                <span className={`px-2.5 py-1 rounded-md text-[11px] font-black border ${pro.stanceColor}`}>
                                  {pro.stanceLabel}
                                </span>
                                <span className="text-[11px] text-[#7890a8]">{pro.timeAgo.replace(/\s*trên\s+.+$/i, '')}</span>
                              </div>
                            </div>

                            {areCommentsUnlockedForTopic(activeThread.id) ? (
                              <>
                                {/* Luận điểm trích dẫn cốt lõi (Đã mở khóa dịch) */}
                                {pro.quote && (
                                  <div className="p-2.5 rounded-lg bg-[#0f1d2e] border-l-4 border-blue-400 text-xs text-blue-200 italic flex items-start gap-2">
                                    <Quote className="w-3.5 h-3.5 text-blue-400 shrink-0 mt-0.5" />
                                    <span>"{pro.quote}"</span>
                                  </div>
                                )}

                                {/* Nội dung phân tích chi tiết của Pro (Đã mở khóa dịch) */}
                                <p className="text-xs sm:text-sm text-[#dce7f5] leading-relaxed whitespace-pre-wrap">
                                  {pro.content}
                                </p>
                              </>
                            ) : (
                              <div className="space-y-2">
                                <div className="p-2.5 rounded-lg bg-[#0b1522] border border-blue-800/50 text-xs text-slate-400 font-mono italic">
                                  [Original Foreign Comment — {pro.proName}]: "In this spot, range construction and blocker effects dictate our river frequency. Checking back surrenders too much EV against capped lines, while sizing up polarizes our range..."
                                </div>
                                <div className="relative rounded-lg bg-[#0d1826] border border-amber-500/40 p-3 overflow-hidden">
                                  <p className="text-xs text-[#dce7f5]/30 blur-[4px] select-none pointer-events-none line-clamp-2">
                                    {pro.content}
                                  </p>
                                  <div className="mt-2 flex items-center justify-between flex-wrap gap-2 pt-2 border-t border-blue-900/50">
                                    <span className="text-[11px] text-amber-300 font-semibold flex items-center gap-1">
                                      <Globe2 className="w-3.5 h-3.5" />
                                      Bình luận gốc quốc tế
                                    </span>
                                    <button
                                      type="button"
                                      onClick={handleOpenUnlockCommentsModal}
                                      className="px-3.5 py-1 rounded-lg bg-gradient-to-r from-[#ffd875] to-[#8b6b23] text-slate-950 font-black text-[11px] cursor-pointer shadow flex items-center gap-1"
                                    >
                                      <span>🌐 Dịch sang {SUPPORTED_LANGUAGES.find((l) => l.code === nativeLang)?.label || 'tiếng bản địa'} của bạn nhé</span>
                                    </button>
                                  </div>
                                </div>
                              </div>
                            )}

                            {/* Chân thẻ: Like và Nút phản biện */}
                            <div className="flex items-center justify-between pt-2 border-t border-[#142335] text-xs">
                              <button
                                onClick={(e) => handleLikePro(e, pro.id, pro.likes)}
                                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-[#14253a] hover:bg-[#1c3554] text-blue-300 font-bold transition shadow cursor-pointer text-xs"
                              >
                                <ThumbsUp className="w-3.5 h-3.5 text-blue-400" />
                                <span>Đồng thuận ({proLikes[pro.id] !== undefined ? proLikes[pro.id] : pro.likes})</span>
                              </button>

                              <button
                                onClick={() => handleReplyToPro(pro.proName, pro.forumSource)}
                                className="inline-flex items-center gap-1 text-xs text-[#ffd875] hover:text-[#ffe49e] font-bold hover:underline cursor-pointer"
                              >
                                <MessageSquare className="w-3.5 h-3.5" />
                                <span>Phản biện ý kiến này</span>
                              </button>
                            </div>
                          </div>
                        ))}
                    </div>
                  </div>
                )}
                  </>
                )}

                {/* Chữ Ký Thành Viên Chuẩn Diễn Đàn */}
                <div className="pt-4 mt-4 border-t border-[#331f10] text-[11px] text-[#8c6b45] italic">
                  _________________<br />
                  Diễn đàn Chơi Poker (choipoker.vercel.app)
                </div>
              </div>
            </div>

            {/* Khu Vực Thảo Luận & Phản Hồi (#2, #3...) */}
            <div className="border border-[#3d2712] rounded-xl overflow-hidden shadow-xl bg-[#140c06] p-5 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#382312] pb-2.5 text-xs">
                <span className="font-bold text-[#f0d8a8] flex items-center gap-1.5">
                  <MessageSquare className="w-4 h-4 text-[#e6b84d]" />
                  Các bình luận khác dưới chủ đề ({activeThread.comments.length} bình luận)
                </span>
                {areCommentsUnlockedForTopic(activeThread.id) ? (
                  <span className="text-[11px] text-emerald-300 bg-emerald-950/80 px-2.5 py-0.5 rounded border border-emerald-700/60 font-bold">
                    ✓ Đã dịch sang {SUPPORTED_LANGUAGES.find((l) => l.code === nativeLang)?.label || 'tiếng bản địa'}{' '}
                    {!hasActiveSubscription() && commentsRemainingSec > 0
                      ? `(Còn ${Math.floor(commentsRemainingSec / 60)}:${String(commentsRemainingSec % 60).padStart(2, '0')})`
                      : '(Hội viên VIP)'}
                  </span>
                ) : (
                  <button
                    type="button"
                    onClick={handleOpenUnlockCommentsModal}
                    className="px-3.5 py-1 rounded-lg bg-gradient-to-r from-[#ffd875] to-[#8b6b23] text-slate-950 font-black text-[11px] cursor-pointer shadow flex items-center gap-1.5 self-start sm:self-auto"
                  >
                    <Globe2 className="w-3.5 h-3.5 text-black" />
                    <span>Dịch sang {SUPPORTED_LANGUAGES.find((l) => l.code === nativeLang)?.label || 'tiếng bản địa'} của bạn nhé</span>
                  </button>
                )}
              </div>

              <div className="space-y-3">
                {activeThread.comments.map((c, idx) => (
                  <div key={c.id} className="bg-[#1c1108] border border-[#3b2310] rounded-lg p-3.5 space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center space-x-2 flex-wrap gap-y-1">
                        <span className="font-bold text-[#f7e0b5]">{c.author}</span>
                        {renderUserRankBadge({
                          username: c.author,
                          role: c.authorRole,
                          roleGroup: c.author === 'Tidu' || c.author.includes('Admin') || c.author.includes('Cố Vấn') ? 'special' : 'athlete',
                          specialRole: c.author === 'Tidu' ? 'coach' : (c.author.includes('Admin') ? 'admin' : c.author.includes('Cố Vấn') ? 'advisor' : undefined),
                          starLevel: c.author === 'Tidu' ? undefined : (c.authorRole === 'Biên tập' ? 4 : (c.author.includes('Cao Thủ') || c.author.includes('Pro') ? 5 : 2))
                        })}
                        {renderWolfBadge(c.author === 'Tidu' ? 4 : (c.authorRole === 'Biên tập' ? 3 : 2))}
                      </div>
                      <span className="text-[11px] text-[#8c6b45]">Bài #{idx + 2} • {c.time}</span>
                    </div>
                    {areCommentsUnlockedForTopic(activeThread.id) ? (
                      <p className="text-xs sm:text-sm text-[#e6d0a8] leading-relaxed pl-2 border-l-2 border-[#8b6b23]/50">
                        {c.content}
                      </p>
                    ) : (
                      <div className="space-y-2 pt-1">
                        <div className="p-2 rounded bg-[#120a05] border border-[#382312] text-[11px] text-[#8c6b45] font-mono italic">
                          [Original Member Reply #{idx + 2} — {c.author}]: "Great breakdown on this spot! Applying proper pot odds and discipline here makes a huge difference to long-term winrate..."
                        </div>
                        <div className="rounded-lg bg-[#140b05] border border-amber-600/40 p-2.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                          <div className="space-y-0.5">
                            <p className="text-xs text-[#e6d0a8]/25 blur-[4px] select-none pointer-events-none line-clamp-1">
                              {c.content}
                            </p>
                            <span className="text-[11px] text-amber-300/90 font-semibold flex items-center gap-1">
                              <Globe2 className="w-3.5 h-3.5" />
                              Bình luận gốc chưa chuyển ngữ
                            </span>
                          </div>
                          <button
                            type="button"
                            onClick={handleOpenUnlockCommentsModal}
                            className="px-3.5 py-1 rounded-lg bg-gradient-to-r from-[#ffd875] to-[#8b6b23] text-slate-950 font-black text-[11px] cursor-pointer shadow shrink-0 self-start sm:self-auto"
                          >
                            🌐 Dịch sang {SUPPORTED_LANGUAGES.find((l) => l.code === nativeLang)?.label || 'tiếng bản địa'} của bạn nhé
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Form Gửi Bình Luận */}
              {currentUser ? (
                <form onSubmit={handlePostComment} className="pt-2 space-y-2.5 border-t border-[#382312]">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <label className="text-xs font-semibold text-[#f0d8a8] block">
                      Gửi phản hồi với tư cách <strong>{currentUser.username}</strong> ({currentUser.role}):
                    </label>
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="text-[11px] font-bold text-[#ffd875]">Góc nhìn:</span>
                      <button
                        type="button"
                        onClick={() => setCommentStance('shove')}
                        className={`px-2 py-0.5 rounded text-[10px] font-bold transition-all cursor-pointer ${
                          commentStance === 'shove' ? 'bg-rose-700 text-white shadow' : 'bg-[#1e1107] text-rose-300 border border-rose-900'
                        }`}
                      >
                        🔥 Shove All-in
                      </button>
                      <button
                        type="button"
                        onClick={() => setCommentStance('fold')}
                        className={`px-2 py-0.5 rounded text-[10px] font-bold transition-all cursor-pointer ${
                          commentStance === 'fold' ? 'bg-emerald-700 text-white shadow' : 'bg-[#1e1107] text-emerald-300 border border-emerald-900'
                        }`}
                      >
                        🛡️ Bỏ Bài (Fold)
                      </button>
                      <button
                        type="button"
                        onClick={() => setCommentStance('gto')}
                        className={`px-2 py-0.5 rounded text-[10px] font-bold transition-all cursor-pointer ${
                          commentStance === 'gto' ? 'bg-cyan-700 text-white shadow' : 'bg-[#1e1107] text-cyan-300 border border-cyan-900'
                        }`}
                      >
                        🧠 Solver GTO
                      </button>
                      <button
                        type="button"
                        onClick={() => setCommentStance('exploit')}
                        className={`px-2 py-0.5 rounded text-[10px] font-bold transition-all cursor-pointer ${
                          commentStance === 'exploit' ? 'bg-amber-700 text-white shadow' : 'bg-[#1e1107] text-amber-300 border border-amber-900'
                        }`}
                      >
                        🎯 Khai Thác
                      </button>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <textarea
                      id="forum-comment-box"
                      value={commentText}
                      onChange={(e) => setCommentText(e.target.value)}
                      placeholder="Nhập nội dung chia sẻ, phân tích hoặc phản biện các Pro..."
                      rows={2}
                      className="flex-1 bg-[#0d0703] border border-[#3d2712] rounded-lg p-2.5 text-xs text-[#fce8ba] placeholder-[#8c6b45] focus:outline-none focus:border-[#b8933b]"
                    />
                    <button
                      type="submit"
                      disabled={submittingComment || !commentText.trim()}
                      className="px-4 rounded-lg bg-[#8b6b23] hover:bg-[#a6822e] text-slate-950 text-xs font-bold transition-all disabled:opacity-50 self-end py-2.5 cursor-pointer shadow"
                    >
                      Gửi Bài
                    </button>
                  </div>
                </form>
              ) : (
                <div className="p-3 bg-[#170e08] rounded-lg text-center text-xs text-[#a68a56]">
                  Vui lòng <button onClick={() => setShowAuthModal(true)} className="text-[#f5d77f] font-bold underline cursor-pointer">Đăng nhập</button> để gửi phản hồi vào bài viết này.
                </div>
              )}
            </div>

            {/* ========================================================
                CÁC PHẦN DƯỚI BÌNH LUẬN: BẢN DỊCH, AI KHUYẾN NGHỊ & NGUỒN TRÍCH DẪN
            ======================================================== */}
            <div className="border border-[#3d2712] rounded-xl overflow-hidden shadow-xl bg-[#140c06] p-5 space-y-5">
              {/* 1. BẢN DỊCH & PHÂN TÍCH CHI TIẾT SANG NGÔN NGỮ BẢN ĐỊA (MIỄN PHÍ 100%) */}
              <div className="space-y-3">
                <div className="space-y-2">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <h3 className="text-sm font-bold text-[#f5d77f] uppercase tracking-wide flex items-center gap-1.5">
                      <BarChart3 className="w-4 h-4 text-[#e6b84d]" />
                      {activeThread.mainSection === 'tong-hop-dien-dan'
                        ? 'Bản dịch nội dung bài viết & Phân tích sang ngôn ngữ bản địa:'
                        : activeThread.mainSection === 'trao-doi-chinh'
                        ? 'Nội dung phân tích sâu vấn đề & Hệ thống tư duy CLB:'
                        : 'Nội dung bài giảng & giáo trình đào tạo:'}
                    </h3>
                    <span className="px-2.5 py-0.5 rounded-full bg-emerald-950/90 border border-emerald-600/60 text-emerald-300 text-[10px] font-bold">
                      ✓ Miễn phí bản dịch bài viết chính ({SUPPORTED_LANGUAGES.find((l) => l.code === nativeLang)?.flag}{' '}
                      {SUPPORTED_LANGUAGES.find((l) => l.code === nativeLang)?.label})
                    </span>
                  </div>
                  <div className="bg-[#120a05] border border-[#382312] rounded-lg p-4 text-xs sm:text-sm text-[#f0dfc0] leading-relaxed whitespace-pre-wrap">
                    {activeThread.detailedAnalysis}
                  </div>
                </div>

                {/* 2. KHUYẾN NGHỊ AI & GIẢI PHÁP SOLVER & KHAI THÁC THỰC TẾ (Xem Video 1 Phút hoặc Quét VietQR từ 5k) */}
                {(activeThread.gtoRecommendations || activeThread.keyTakeaways) && (
                  <div className="space-y-3 pt-2">
                    <div className="flex items-center justify-between flex-wrap gap-2">
                      <h3 className="text-sm font-bold text-emerald-400 uppercase tracking-wide flex items-center gap-1.5">
                        <Cpu className="w-4 h-4" />
                        {activeThread.mainSection === 'trao-doi-chinh'
                          ? '🤖 AI Khuyến nghị: Giải pháp khắc phục & Nguyên tắc kỷ luật thực chiến:'
                          : '🤖 AI Khuyến nghị: Giải pháp Solver & Khai thác thực tế:'}
                      </h3>
                      {areCommentsUnlockedForTopic(activeThread.id) ? (
                        <span className="px-2.5 py-0.5 rounded-full bg-emerald-950 border border-emerald-500/70 text-emerald-300 text-[10px] font-bold">
                          ✓ Đã mở khóa AI Khuyến nghị
                        </span>
                      ) : (
                        <span className="px-2.5 py-0.5 rounded-full bg-amber-950 border border-amber-500/70 text-amber-300 text-[10px] font-bold flex items-center gap-1">
                          <Lock className="w-3 h-3" />
                          Cần Subscribe YouTube @choipoker hoặc Quét QR
                        </span>
                      )}
                    </div>

                    {areCommentsUnlockedForTopic(activeThread.id) ? (
                      <>
                        {activeThread.gtoRecommendations && (
                          <div className="bg-[#0c140e] border border-[#1b3d24] rounded-lg p-4 text-xs sm:text-sm text-[#c8eed0] leading-relaxed whitespace-pre-wrap">
                            {activeThread.gtoRecommendations}
                          </div>
                        )}

                        {activeThread.keyTakeaways && (
                          <div className="p-3.5 rounded-lg bg-[#24160a] border border-[#573516] space-y-1.5">
                            <h4 className="text-xs font-bold text-amber-300 uppercase flex items-center gap-1">
                              <Award className="w-3.5 h-3.5 text-[#e6b84d]" />
                              Đúc Kết Thực Chiến Chuẩn CLB:
                            </h4>
                            <ul className="list-disc list-inside space-y-1 text-xs text-[#fce8ba]">
                              {activeThread.keyTakeaways.map((item, idx) => (
                                <li key={idx} className="leading-relaxed">
                                  {item}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </>
                    ) : (
                      <div className="rounded-xl bg-gradient-to-br from-[#0c1610] via-[#131e15] to-[#1a1007] border-2 border-amber-500/80 p-4 space-y-3 shadow-xl relative overflow-hidden">
                        {/* Nội dung AI Khuyến nghị bị làm mờ */}
                        <div className="space-y-2 blur-[5px] select-none pointer-events-none opacity-35">
                          {activeThread.gtoRecommendations && (
                            <div className="bg-[#0c140e] border border-[#1b3d24] rounded-lg p-3 text-xs text-[#c8eed0] line-clamp-3">
                              {activeThread.gtoRecommendations}
                            </div>
                          )}
                          {activeThread.keyTakeaways && (
                            <ul className="list-disc list-inside text-xs text-[#fce8ba] line-clamp-2">
                              {activeThread.keyTakeaways.map((item, idx) => (
                                <li key={idx}>{item}</li>
                              ))}
                            </ul>
                          )}
                        </div>

                        {/* Hộp yêu cầu Xem video 1 phút hoặc Quét QR MBBank */}
                        <div className="p-3.5 rounded-xl bg-[#140b05]/95 border border-amber-500/60 space-y-2.5">
                          <div className="text-xs font-black text-[#ffd875] flex items-center gap-1.5">
                            <Lock className="w-4 h-4 text-amber-400 shrink-0" />
                            <span>PHẦN KHUYẾN NGHỊ CỦA AI & ĐÚC KẾT THỰC CHIẾN ĐANG KHÓA</span>
                          </div>
                          <p className="text-[11px] text-[#e6cb9c] leading-relaxed">
                            Nội dung <strong>AI Khuyến nghị & Giải pháp khai thác thực tế</strong> được phân tích chuyên sâu. Để xem ngay phân tích của AI cho chủ đề này, Quý Cao thủ vui lòng chọn:
                          </p>
                          <div className="flex flex-wrap items-center gap-2.5 pt-1">
                            <a
                              href="https://www.youtube.com/@choipoker?sub_confirmation=1"
                              target="_blank"
                              rel="noopener noreferrer"
                              onClick={() => {
                                handleOpenUnlockCommentsModal();
                                setActiveYoutubeIdx(0);
                                setAdSecondsLeft(AD_COMMENTS_DURATION_SECONDS);
                                setAdPlaying(true);
                              }}
                              className="px-3.5 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white font-black text-xs shadow-lg cursor-pointer transition-all flex items-center gap-1.5"
                            >
                              <span>▶️ Xem Video Giới Thiệu 1 Phút (Mở Khóa AI Miễn Phí)</span>
                            </a>
                            <button
                              type="button"
                              onClick={handleOpenUnlockCommentsModal}
                              className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-[#ffd875] to-[#8b6b23] hover:from-[#ffe299] hover:to-[#a6822e] text-slate-950 font-black text-xs shadow-lg cursor-pointer transition-all flex items-center gap-1.5"
                            >
                              <span>⚡ Quét Mã QR Mở Khóa (Từ 5k - Cốc Trà Đá)</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* 3. HỘP TRÍCH DẪN NGUỒN BÀI VIẾT GỐC */}
              <div className="p-3.5 rounded-lg bg-[#1c1108] border border-[#4d3016] flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-[#d1ba88]">
                <div className="flex items-center space-x-2">
                  <Globe2 className="w-4 h-4 text-[#e6b84d] shrink-0" />
                  <span>
                    <strong>Nguồn trích dẫn bài viết gốc:</strong> {activeThread.originalSource}
                  </span>
                </div>
                <span className="text-[11px] text-[#8c6b45] italic shrink-0">Biên tập cho diễn đàn Học Poker</span>
              </div>
            </div>
          </div>
        ) : (
          /* ========================================================
              TRANG CHỦ BẢNG DIỄN ĐÀN (3 MỤC CHÍNH CHUẨN FORUMVI)
          ======================================================== */
          <div className="space-y-6">
            {/* THANH ĐIỀU HƯỚNG DIỄN ĐÀN */}
            <div className="bg-[#191008] border-2 border-[#543317] rounded-2xl p-2.5 sm:p-3 shadow-2xl">
              <div className="category-bar menu-container nav-bar flex flex-wrap gap-2 text-xs font-bold w-full">
                <button
                  onClick={() => { setSelectedSection('all'); setSelectedCategory('all'); scrollToForumBoard('smooth'); }}
                  className={`menu-item nav-button px-3.5 py-2 rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer flex-1 min-w-[120px] sm:min-w-0 ${
                    selectedSection === 'all'
                      ? 'bg-gradient-to-r from-[#ffd875] to-[#8b6b23] text-slate-950 font-black shadow-lg scale-[1.01]'
                      : 'bg-[#120a05] text-[#d1ba88] border border-[#3b2310] hover:bg-[#24150b]'
                  }`}
                >
                  <Sparkles className="w-4 h-4 text-amber-500" />
                  <span className="font-bold text-xs sm:text-sm">Tất cả</span>
                </button>

                <button
                  onClick={() => { setSelectedSection('tong-hop-dien-dan'); setSelectedCategory('all'); scrollToForumBoard('smooth'); }}
                  className={`menu-item nav-button px-3.5 py-2 rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer flex-1 min-w-[140px] sm:min-w-0 ${
                    selectedSection === 'tong-hop-dien-dan'
                      ? 'bg-gradient-to-r from-[#ffd875] to-[#8b6b23] text-slate-950 font-black shadow-lg scale-[1.01]'
                      : 'bg-[#120a05] text-[#d1ba88] border border-[#3b2310] hover:bg-[#24150b]'
                  }`}
                >
                  <Globe2 className="w-4 h-4 text-blue-400" />
                  <span className="font-bold text-xs sm:text-sm">1. Thảo luận mới</span>
                </button>

                <button
                  onClick={() => { setSelectedSection('trao-doi-chinh'); setSelectedCategory('all'); scrollToForumBoard('smooth'); }}
                  className={`menu-item nav-button px-3.5 py-2 rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer flex-1 min-w-[140px] sm:min-w-0 ${
                    selectedSection === 'trao-doi-chinh'
                      ? 'bg-gradient-to-r from-[#ffd875] to-[#8b6b23] text-slate-950 font-black shadow-lg scale-[1.01]'
                      : 'bg-[#120a05] text-[#d1ba88] border border-[#3b2310] hover:bg-[#24150b]'
                  }`}
                >
                  <MessageSquare className="w-4 h-4 text-emerald-400" />
                  <span className="font-bold text-xs sm:text-sm">2. Phân tích sâu vấn đề</span>
                </button>

                <button
                  onClick={() => { setSelectedSection('giang-day-nghien-cuu'); setSelectedCategory('all'); scrollToForumBoard('smooth'); }}
                  className={`menu-item nav-button px-3.5 py-2 rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer flex-1 min-w-[140px] sm:min-w-0 ${
                    selectedSection === 'giang-day-nghien-cuu'
                      ? 'bg-gradient-to-r from-[#ffd875] to-[#8b6b23] text-slate-950 font-black shadow-lg scale-[1.01]'
                      : 'bg-[#120a05] text-[#d1ba88] border border-[#3b2310] hover:bg-[#24150b]'
                  }`}
                >
                  <GraduationCap className="w-4 h-4 text-amber-400" />
                  <span className="font-bold text-xs sm:text-sm">3. Từ Gà hóa Sói</span>
                </button>
              </div>
            </div>

            {/* ĐIỂM NEO MÀN HÌNH CHÍNH KHI VÀO DIỄN ĐÀN */}
            <div id="forum-board-start" className="space-y-4 scroll-mt-1">
              {/* Thanh Tìm Kiếm Nhanh & Chọn Ngôn Ngữ Theo Quốc Gia */}
              <div className="bg-[#170e08] border border-[#3b2310] rounded-xl p-2.5 flex flex-col lg:flex-row items-center justify-between gap-2.5 shadow-md">
                <div className="flex items-center flex-wrap gap-2 text-xs text-[#d1ba88] w-full lg:w-auto">
                  <Filter className="w-4 h-4 text-[#ffd875] shrink-0" />
                  <span className="font-bold">Đang xem:</span>
                  <span className="px-2 py-0.5 rounded bg-[#2b190c] text-[#ffd875] border border-[#543317] font-semibold">
                    {selectedSection === 'all'
                      ? 'Toàn bộ 3 phân khu độc lập'
                      : selectedSection === 'tong-hop-dien-dan'
                      ? 'Phân khu 1: Thảo luận mới'
                      : selectedSection === 'trao-doi-chinh'
                      ? 'Phân khu 2: Phân tích sâu vấn đề'
                      : 'Phân khu 3: Từ Gà hóa Sói'}
                  </span>
                  {selectedCategory !== 'all' && (
                    <button
                      onClick={() => setSelectedCategory('all')}
                      className="text-[11px] text-rose-400 underline cursor-pointer"
                    >
                      (Xóa lọc con)
                    </button>
                  )}
                </div>

                {/* Bộ chọn Ngôn ngữ tự động theo Quốc gia + Tìm kiếm */}
                <div className="flex flex-col sm:flex-row items-center gap-2 w-full lg:w-auto">
                  <div className="flex items-center gap-1.5 bg-[#0d0703] border border-[#4a3016] rounded-lg px-2.5 py-1 text-xs w-full sm:w-auto justify-between sm:justify-start">
                    <span className="text-[11px] text-amber-300/90 font-semibold whitespace-nowrap flex items-center gap-1">
                      <Globe2 className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                      <span>Ngôn ngữ ({detectedCountryCode}):</span>
                    </span>
                    <select
                      value={activeLang}
                      onChange={(e) => handleSelectLanguage(e.target.value)}
                      className="bg-[#1c1008] text-[#ffd875] font-bold text-xs rounded px-2 py-0.5 border border-[#54361b] focus:outline-none cursor-pointer"
                      title="Ngôn ngữ bản địa miễn phí. Đổi sang ngôn ngữ khác cần xem quảng cáo (1 chủ đề / 30 phút) hoặc đăng ký gói Tháng/Năm."
                    >
                      {SUPPORTED_LANGUAGES.map((lang) => {
                        const isNative = lang.code === nativeLang;
                        const unlocked = isLanguageUnlockedForCurrentTopic(lang.code, nativeLang, activeThread?.id || null);
                        return (
                          <option key={lang.code} value={lang.code} className="bg-[#140b05] text-[#fce8ba]">
                            {lang.flag} {lang.label}{' '}
                            {isNative ? '(Ngôn ngữ của bạn)' : unlocked ? '✓' : ''}
                          </option>
                        );
                      })}
                    </select>
                  </div>

                  <form onSubmit={handleSearch} className="relative w-full sm:w-60">
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Tìm kiếm chủ đề..."
                      className="w-full bg-[#0d0703] border border-[#3d2712] rounded-lg pl-8 pr-3 py-1.5 text-xs text-[#fce8ba] placeholder-[#8c6b45] focus:outline-none focus:border-[#b8933b]"
                    />
                    <Search className="w-3.5 h-3.5 text-[#8c6b45] absolute left-2.5 top-2" />
                  </form>
                </div>
              </div>
            {/* ========================================================
                BẢNG 1: TỔNG HỢP CÁC THÔNG TIN TỪ DIỄN ĐÀN (Quốc Tế 365 Ngày)
            ======================================================== */}
            {(selectedSection === 'all' || selectedSection === 'tong-hop-dien-dan') && (
              <div className="border-2 border-blue-700/70 rounded-2xl overflow-hidden shadow-2xl bg-[#140c06] space-y-0">
                {/* Header Mục 1 */}
                <div
                  className="px-4 py-2.5 border-b-2 border-blue-700/70 flex items-center justify-between gap-2"
                  style={{
                    backgroundImage: "url('/assets/forum/i_back_title.png')",
                    backgroundRepeat: 'repeat-x',
                    backgroundColor: '#101c2b'
                  }}
                >
                  <div className="flex items-center space-x-2">
                    <div className="w-7 h-7 rounded-lg bg-blue-600 text-white flex items-center justify-center font-black shadow shrink-0">
                      <Globe2 className="w-4 h-4 text-white" />
                    </div>
                    <h2 className="font-black text-sm sm:text-base text-blue-300 tracking-wide uppercase">
                      1. Thảo luận mới
                    </h2>
                  </div>
                </div>

                {/* Thanh Lọc Thể Loại */}
                <div className="bg-[#0c1624] border-b border-[#1b2b3d] px-4 py-2.5 flex items-center justify-between gap-2 flex-wrap">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="text-[11px] font-bold text-amber-300 flex items-center gap-1 mr-1">
                      <Filter className="w-3.5 h-3.5 text-amber-400" />
                      Thể loại:
                    </span>
                    <button
                      onClick={() => setPk1FormatFilter('all')}
                      className={`px-2.5 py-1 rounded text-[11px] font-bold cursor-pointer transition-all ${
                        pk1FormatFilter === 'all'
                          ? 'bg-amber-600 text-white shadow'
                          : 'bg-[#132235] text-amber-200/80 hover:bg-[#1a2f4a]'
                      }`}
                    >
                      🌟 Tất cả
                    </button>
                    <button
                      onClick={() => setPk1FormatFilter('online')}
                      className={`px-2.5 py-1 rounded text-[11px] font-bold cursor-pointer transition-all ${
                        pk1FormatFilter === 'online'
                          ? 'bg-sky-600 text-white shadow'
                          : 'bg-[#132235] text-sky-300 hover:bg-[#1a2f4a]'
                      }`}
                    >
                      🌐 Online
                    </button>
                    <button
                      onClick={() => setPk1FormatFilter('live')}
                      className={`px-2.5 py-1 rounded text-[11px] font-bold cursor-pointer transition-all ${
                        pk1FormatFilter === 'live'
                          ? 'bg-emerald-600 text-white shadow'
                          : 'bg-[#132235] text-emerald-300 hover:bg-[#1a2f4a]'
                      }`}
                    >
                      ♠️ Live
                    </button>
                    <button
                      onClick={() => setPk1FormatFilter('tournament')}
                      className={`px-2.5 py-1 rounded text-[11px] font-bold cursor-pointer transition-all ${
                        pk1FormatFilter === 'tournament'
                          ? 'bg-purple-600 text-white shadow'
                          : 'bg-[#132235] text-purple-300 hover:bg-[#1a2f4a]'
                      }`}
                    >
                      🏆 Tournament
                    </button>
                    <button
                      onClick={() => setPk1FormatFilter('cash')}
                      className={`px-2.5 py-1 rounded text-[11px] font-bold cursor-pointer transition-all ${
                        pk1FormatFilter === 'cash'
                          ? 'bg-emerald-700 text-white shadow'
                          : 'bg-[#132235] text-emerald-300 hover:bg-[#1a2f4a]'
                      }`}
                    >
                      💵 Cash Game
                    </button>
                  </div>
                </div>

                {/* Header Cột Bảng */}
                <div className="bg-[#0f1722] border-b border-[#1b2b3d] px-4 py-2 grid grid-cols-12 text-xs font-bold text-blue-300 uppercase tracking-wider">
                  <div className="col-span-12 sm:col-span-7">Chủ đề thảo luận</div>
                  <div className="hidden sm:block sm:col-span-2 text-center">Thống kê</div>
                  <div className="hidden sm:block sm:col-span-3 text-right">Bài gửi mới nhất</div>
                </div>

                {/* Danh Sách Hàng Diễn Đàn Con Mục 1 (Dạng List Gọn Gàng Chuẩn Diễn Đàn) */}
                <div className="divide-y divide-[#172536]">
                  {threads
                    .filter((t) => {
                      if (t.mainSection !== 'tong-hop-dien-dan') return false;

                      // Lọc theo Thể Loại (online, live, tournament, cash)
                      if (pk1FormatFilter !== 'all') {
                        const tags = t.formatTags || [];
                        if (!tags.includes(pk1FormatFilter)) {
                          const contentStr = (t.title + ' ' + t.category + ' ' + (t.handHistory || '')).toLowerCase();
                          if (pk1FormatFilter === 'online' && !contentStr.includes('online') && !contentStr.includes('zoom') && !contentStr.includes('mtt')) return false;
                          if (pk1FormatFilter === 'live' && !contentStr.includes('live') && !contentStr.includes('casino') && !contentStr.includes('straddle')) return false;
                          if (pk1FormatFilter === 'tournament' && !contentStr.includes('tournament') && !contentStr.includes('mtt') && !contentStr.includes('bounty')) return false;
                          if (pk1FormatFilter === 'cash' && !contentStr.includes('cash') && !contentStr.includes('nl') && !contentStr.includes('deepstack')) return false;
                        }
                      }

                      return true;
                    })
                    .map((t) => (
                      <div
                        key={t.id}
                        onClick={() => handleOpenThread(t)}
                        className="p-3.5 sm:p-4 hover:bg-[#0f1d2e] cursor-pointer transition-colors grid grid-cols-12 gap-3 items-center group"
                      >
                        {/* Cột 1: Thông tin câu hỏi & Thể loại */}
                        <div className="col-span-12 sm:col-span-7 flex items-start space-x-3">
                          <img
                            src="/assets/forum/i_folder_big.png"
                            alt="Folder"
                            className="w-5 h-5 sm:w-6 sm:h-6 object-contain mt-0.5 shrink-0 group-hover:scale-110 transition-transform"
                          />
                          <div className="space-y-1.5 flex-1 min-w-0">
                            <div className="flex items-center space-x-2 flex-wrap gap-y-1">
                              {/* Badges Thể Loại (Online, Live, Tournament, Cash) */}
                              {t.formatTags?.map((tag) => (
                                <span
                                  key={tag}
                                  className={`text-[10px] font-black px-2 py-0.5 rounded border uppercase shrink-0 ${
                                    tag === 'online'
                                      ? 'bg-sky-950 text-sky-300 border-sky-700'
                                      : tag === 'live'
                                      ? 'bg-emerald-950 text-emerald-300 border-emerald-700'
                                      : tag === 'tournament'
                                      ? 'bg-purple-950 text-purple-300 border-purple-700'
                                      : 'bg-amber-950 text-amber-300 border-amber-700'
                                  }`}
                                >
                                  {tag === 'online' ? '🌐 Online' : tag === 'live' ? '♠️ Live' : tag === 'tournament' ? '🏆 MTT' : '💵 Cash'}
                                </span>
                              ))}

                              {/* Tiêu Đề Câu Hỏi */}
                              <h4 className="font-bold text-sm text-[#f0d8a8] group-hover:text-blue-300 transition-colors">
                                {t.title}
                              </h4>
                            </div>

                            {/* Tóm tắt ngắn 1 dòng */}
                            <p className="text-xs text-[#a68a56] line-clamp-1 group-hover:text-[#c4a974] transition-colors">
                              {t.summary}
                            </p>

                            {/* Meta & Nút Xem Tranh Luận Pro Vào Trong */}
                            <div className="flex items-center space-x-2.5 text-[11px] text-[#8c6b45] flex-wrap gap-y-1">
                              <span className="flex items-center gap-1.5">
                                <span>Tác giả:</span>
                                <strong className="text-[#fce8ba]">{t.author}</strong>
                                {renderUserRankBadge({
                                  username: t.author,
                                  role: t.authorRole,
                                  roleGroup: t.author === 'Tidu' ? 'special' : 'athlete',
                                  specialRole: t.author === 'Tidu' ? 'coach' : undefined,
                                  starLevel: t.author === 'Tidu' ? undefined : (t.authorRole === 'Biên tập' ? 4 : 2)
                                })}
                              </span>
                              <span>•</span>
                              <div>{renderRoleBadge(t.authorRole)}</div>
                              {t.proInteractions && t.proInteractions.length > 0 && (
                                <>
                                  <span>•</span>
                                  <span className="inline-flex items-center gap-1 text-blue-300 font-bold bg-[#0d1e33] px-2 py-0.5 rounded border border-blue-800/80 group-hover:border-blue-500 transition-all">
                                    <MessageSquare className="w-3 h-3 text-blue-400" />
                                    <span>{t.proInteractions.length} Pro tranh luận (Vào xem) →</span>
                                  </span>
                                </>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Cột 2: Thống Kê Số Lượng */}
                        <div className="col-span-6 sm:col-span-2 text-left sm:text-center text-xs text-[#a68a56]">
                          <div className="font-bold text-[#fce8ba]">
                            {(t.proInteractions?.length || 0) + t.comments.length} thảo luận
                          </div>
                          <div className="text-[11px]">{t.views} xem</div>
                        </div>

                        {/* Cột 3: Phản Hồi Mới Nhất */}
                        <div className="col-span-6 sm:col-span-3 text-right text-xs text-[#a68a56]">
                          <div className="text-[#ffd875] font-semibold truncate max-w-[140px] ml-auto">
                            {t.comments.length > 0
                              ? t.comments[t.comments.length - 1].author
                              : t.proInteractions && t.proInteractions.length > 0
                              ? t.proInteractions[t.proInteractions.length - 1].proName
                              : t.author}
                          </div>
                          <div className="text-[11px] text-[#8c6b45]">{t.publishedAt}</div>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            )}

            {/* ========================================================
                BẢNG 2: TRAO ĐỔI THÔNG TIN DIỄN ĐÀN CHÍNH (hocpoker.forumvi.com)
            ======================================================== */}
            {(selectedSection === 'all' || selectedSection === 'trao-doi-chinh') && (
              <div className="border-2 border-emerald-700/70 rounded-2xl overflow-hidden shadow-2xl bg-[#140c06] space-y-0">
                {/* Header Mục 2 */}
                <div
                  className="px-4 py-2.5 border-b-2 border-emerald-700/70 flex items-center justify-between gap-2"
                  style={{
                    backgroundImage: "url('/assets/forum/i_back_title.png')",
                    backgroundRepeat: 'repeat-x',
                    backgroundColor: '#1b2612'
                  }}
                >
                  <div className="flex items-center space-x-2">
                    <div className="w-7 h-7 rounded-lg bg-emerald-600 text-slate-950 flex items-center justify-center font-black shadow shrink-0">
                      <MessageSquare className="w-4 h-4 text-black" />
                    </div>
                    <h2 className="font-black text-sm sm:text-base text-emerald-300 tracking-wide uppercase">
                      2. Phân tích sâu vấn đề
                    </h2>
                  </div>
                </div>

                {/* BANNER TƯƠNG TÁC: ĐẶT VẤN ĐỀ CẦN PHÂN TÍCH SÂU */}
                <div className="bg-gradient-to-r from-[#0d1f13] via-[#142d1b] to-[#0d1f13] border-b border-[#1b3d22] p-3 sm:p-4">
                  <div className="flex items-center justify-between gap-3 flex-wrap">
                    <div className="flex items-center space-x-2">
                      <span className="px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-600 text-[10px] font-black uppercase tracking-wider flex items-center gap-1">
                        <Flame className="w-3 h-3 text-emerald-400" />
                        CHUYÊN ĐỀ HỆ THỐNG
                      </span>
                      <span className="text-xs font-bold text-emerald-200">
                        Phân tích sâu lỗ hổng tư duy (Leaks), cấu trúc bàn chơi, tâm lý & quản trị vốn
                      </span>
                    </div>

                    <button
                      onClick={() => setShowHandForm(!showHandForm)}
                      className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-700 hover:from-emerald-400 hover:to-emerald-600 text-slate-950 font-black text-xs transition-all shadow-lg flex items-center gap-1.5 shrink-0 cursor-pointer"
                    >
                      <PlusCircle className="w-4 h-4 text-black" />
                      <span>{showHandForm ? 'Đóng Khung Nhập' : 'Đặt Vấn Đề Cần Phân Tích Sâu'}</span>
                    </button>
                  </div>

                  {/* FORM NHẬP THÔNG SỐ VÁN BÀI (MỞ RA KHI BẤM) */}
                  {showHandForm && (
                    <form onSubmit={handleSubmitHand} className="mt-4 p-4 rounded-xl bg-[#0a160d] border border-emerald-600/70 shadow-2xl space-y-3.5 animate-fade-in">
                      <div className="flex items-center justify-between border-b border-[#183820] pb-2">
                        <span className="text-xs font-black text-emerald-300 uppercase tracking-wider flex items-center gap-1.5">
                          <Sliders className="w-3.5 h-3.5 text-emerald-400" />
                          Thông Số Bàn Chơi Cần Mổ Xẻ
                        </span>
                        <span className="text-[11px] text-[#86a88d]">
                          Đăng bởi: <strong className="text-emerald-300">{currentUser?.username || 'Bạn'}</strong>
                        </span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                        <div>
                          <label className="block text-[11px] font-bold text-emerald-300 mb-1">
                            1. Vị trí trên bàn:
                          </label>
                          <select
                            value={handForm.position}
                            onChange={(e) => setHandForm({ ...handForm, position: e.target.value })}
                            className="w-full bg-[#050e07] border border-[#1b3d22] rounded-lg px-2.5 py-1.5 text-xs text-[#e0f0e3] focus:border-emerald-500 focus:outline-none"
                          >
                            <option value="BTN (Button)">BTN (Button - Lợi thế nhất)</option>
                            <option value="CO (Cutoff)">CO (Cutoff)</option>
                            <option value="MP (Middle Position)">MP (Middle Position)</option>
                            <option value="UTG (Under The Gun)">UTG (Đầu vòng)</option>
                            <option value="SB (Small Blind)">SB (Mù nhỏ)</option>
                            <option value="BB (Big Blind)">BB (Mù lớn)</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-[11px] font-bold text-emerald-300 mb-1">
                            2. Độ sâu Stack:
                          </label>
                          <select
                            value={handForm.stack}
                            onChange={(e) => setHandForm({ ...handForm, stack: e.target.value })}
                            className="w-full bg-[#050e07] border border-[#1b3d22] rounded-lg px-2.5 py-1.5 text-xs text-[#e0f0e3] focus:border-emerald-500 focus:outline-none"
                          >
                            <option value="100BB (Sâu)">100BB (Stack Sâu tiêu chuẩn)</option>
                            <option value="150BB+ (Rất sâu)">150BB+ (Deep Stack)</option>
                            <option value="50BB (Trung bình)">50BB (Stack trung bình)</option>
                            <option value="25BB (Ngắn)">25BB (Short Stack)</option>
                            <option value="<15BB (Push/Fold)">Dưới 15BB (Vùng Push/Fold)</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-[11px] font-bold text-emerald-300 mb-1">
                            3. Ngoại cảnh / Thể loại:
                          </label>
                          <select
                            value={handForm.gameType}
                            onChange={(e) => setHandForm({ ...handForm, gameType: e.target.value })}
                            className="w-full bg-[#050e07] border border-[#1b3d22] rounded-lg px-2.5 py-1.5 text-xs text-[#e0f0e3] focus:border-emerald-500 focus:outline-none"
                          >
                            <option value="Cash Game 6-max">Cash Game 6-max</option>
                            <option value="Cash Game Live (Trực tiếp)">Cash Game Live (Trực tiếp)</option>
                            <option value="Giải đấu MTT">Giải đấu Tournament (MTT)</option>
                            <option value="Sit & Go (SNG)">Sit & Go (SNG)</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-[11px] font-bold text-emerald-300 mb-1">
                            4. Giai đoạn giải:
                          </label>
                          <select
                            value={handForm.stage}
                            onChange={(e) => setHandForm({ ...handForm, stage: e.target.value })}
                            className="w-full bg-[#050e07] border border-[#1b3d22] rounded-lg px-2.5 py-1.5 text-xs text-[#e0f0e3] focus:border-emerald-500 focus:outline-none"
                          >
                            <option value="Đánh tiền mặt (Cash)">Đánh tiền mặt (Cash)</option>
                            <option value="Đầu giải (Deep Stack)">Đầu giải (Deep Stack)</option>
                            <option value="Giữa giải (Middle Stage)">Giữa giải (Middle Stage)</option>
                            <option value="Cận tiền (Bubble Phase)">Cận tiền (Áp lực Bubble)</option>
                            <option value="Bàn chung kết (Final Table)">Bàn chung kết (Final Table)</option>
                          </select>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-[11px] font-bold text-emerald-300 mb-1">
                            Bài tẩy của bạn (Cards):
                          </label>
                          <input
                            type="text"
                            value={handForm.cards}
                            onChange={(e) => setHandForm({ ...handForm, cards: e.target.value })}
                            placeholder="Ví dụ: A♠ K♠ hoặc Q♥ Q♦ hoặc 9♣ 10♣"
                            className="w-full bg-[#050e07] border border-[#1b3d22] rounded-lg px-2.5 py-1.5 text-xs text-[#e0f0e3] focus:border-emerald-500 focus:outline-none placeholder-[#4b6d51]"
                          />
                        </div>

                        <div>
                          <label className="block text-[11px] font-bold text-emerald-300 mb-1">
                            Mặt bài chia (Board - Flop / Turn / River):
                          </label>
                          <input
                            type="text"
                            value={handForm.board}
                            onChange={(e) => setHandForm({ ...handForm, board: e.target.value })}
                            placeholder="Ví dụ: K♦ 7♣ 2♠ (Flop) | 10♥ (Turn) | 4♣ (River)"
                            className="w-full bg-[#050e07] border border-[#1b3d22] rounded-lg px-2.5 py-1.5 text-xs text-[#e0f0e3] focus:border-emerald-500 focus:outline-none placeholder-[#4b6d51]"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-emerald-300 mb-1">
                          Tiêu đề chủ đề (Tuỳ chọn):
                        </label>
                        <input
                          type="text"
                          value={handForm.title}
                          onChange={(e) => setHandForm({ ...handForm, title: e.target.value })}
                          placeholder="Để trống nếu muốn tự động tạo tiêu đề chuẩn CLB..."
                          className="w-full bg-[#050e07] border border-[#1b3d22] rounded-lg px-2.5 py-1.5 text-xs text-[#e0f0e3] focus:border-emerald-500 focus:outline-none placeholder-[#4b6d51]"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-emerald-300 mb-1">
                          Diễn biến các vòng cược & Thắc mắc cần phân xử: *
                        </label>
                        <textarea
                          rows={3}
                          value={handForm.situation}
                          onChange={(e) => setHandForm({ ...handForm, situation: e.target.value })}
                          placeholder="Mô tả hành động của bạn và đối thủ ở Preflop, Flop, Turn, River. Ví dụ: Preflop UTG raise 2.5BB, tôi ở BTN 3-bet 8BB, đối thủ call. Flop ra K-7-2 rainbow, đối thủ check, tôi C-bet nửa pot, đối thủ check-raise all-in..."
                          className="w-full bg-[#050e07] border border-[#1b3d22] rounded-lg p-2.5 text-xs text-[#e0f0e3] focus:border-emerald-500 focus:outline-none placeholder-[#4b6d51]"
                        />
                      </div>

                      <div className="flex items-center justify-end space-x-2 pt-1">
                        <button
                          type="button"
                          onClick={() => setShowHandForm(false)}
                          className="px-3 py-1.5 rounded-lg bg-[#142318] hover:bg-[#1f3825] text-emerald-300 text-xs font-semibold cursor-pointer"
                        >
                          Hủy bỏ
                        </button>
                        <button
                          type="submit"
                          disabled={submittingHand}
                          className="px-4 py-1.5 rounded-lg bg-gradient-to-r from-emerald-500 to-emerald-700 hover:from-emerald-400 hover:to-emerald-600 text-slate-950 text-xs font-black transition-all shadow-md flex items-center gap-1.5 disabled:opacity-50 cursor-pointer"
                        >
                          {submittingHand ? (
                            <>
                              <Bot className="w-3.5 h-3.5 animate-spin" />
                              <span>AI Trọng Tài Đang Mổ Xẻ...</span>
                            </>
                          ) : (
                            <>
                              <Bot className="w-3.5 h-3.5" />
                              <span>Gửi Ván Bài & Nhận Phán Quyết AI Trọng Tài</span>
                            </>
                          )}
                        </button>
                      </div>
                    </form>
                  )}
                </div>

                {/* Header Cột Bảng */}
                <div className="bg-[#121c13] border-b border-[#1b3d22] px-4 py-2 grid grid-cols-12 text-xs font-bold text-emerald-400 uppercase tracking-wider">
                  <div className="col-span-12 sm:col-span-7">Chủ đề thảo luận</div>
                  <div className="hidden sm:block sm:col-span-2 text-center">Thống kê</div>
                  <div className="hidden sm:block sm:col-span-3 text-right">Bài gửi mới nhất</div>
                </div>

                {/* Danh Sách Hàng Diễn Đàn Con Mục 2 */}
                <div className="divide-y divide-[#182e1d]">
                  {threads
                    .filter((t) => t.mainSection === 'trao-doi-chinh')
                    .map((t) => (
                      <div
                        key={t.id}
                        onClick={() => handleOpenThread(t)}
                        className="p-3.5 sm:p-4 hover:bg-[#122216] cursor-pointer transition-colors grid grid-cols-12 gap-3 items-center"
                      >
                        <div className="col-span-12 sm:col-span-7 flex items-start space-x-3">
                          <img
                            src="/assets/forum/i_folder_big.png"
                            alt="Folder"
                            className="w-5 h-5 sm:w-6 sm:h-6 object-contain mt-0.5 shrink-0"
                          />
                          <div className="space-y-1">
                            <div className="flex items-center space-x-2 flex-wrap">
                              <span className="text-[10px] font-black px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-700 shrink-0">
                                PHÂN TÍCH SÂU
                              </span>
                              <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-[#182b1d] text-emerald-300 border border-[#2b5435]">
                                {t.subForum}
                              </span>
                              <h4 className="font-bold text-sm text-[#f0d8a8] hover:text-emerald-300 transition-colors">
                                {t.title}
                              </h4>
                            </div>
                            <p className="text-xs text-[#a68a56] line-clamp-1">{t.summary}</p>
                            <div className="flex items-center space-x-2 text-[11px] text-[#8c6b45] flex-wrap gap-y-1">
                              <span className="flex items-center gap-1.5">
                                <span>Tác giả:</span>
                                <strong className="text-[#fce8ba]">{t.author}</strong>
                                {renderUserRankBadge({
                                  username: t.author,
                                  role: t.authorRole,
                                  roleGroup: t.author === 'Tidu' ? 'special' : 'athlete',
                                  specialRole: t.author === 'Tidu' ? 'coach' : undefined,
                                  starLevel: t.author === 'Tidu' ? undefined : (t.authorRole === 'Biên tập' ? 4 : 2)
                                })}
                              </span>
                              <span>•</span>
                              <div>{renderRoleBadge(t.authorRole)}</div>
                            </div>
                          </div>
                        </div>

                        <div className="col-span-6 sm:col-span-2 text-left sm:text-center text-xs text-[#a68a56]">
                          <div className="font-bold text-[#fce8ba]">{t.replies} trả lời</div>
                          <div className="text-[11px]">{t.views} xem</div>
                        </div>

                        <div className="col-span-6 sm:col-span-3 text-right text-xs text-[#a68a56]">
                          <div className="flex items-center justify-end space-x-2">
                            {t.author === 'Tidu' && (
                              <img
                                src="/assets/forum/avatar_tidu.jpg"
                                alt="Tidu Avatar"
                                className="w-6 h-6 rounded object-cover border border-emerald-500"
                              />
                            )}
                            <div className="text-right">
                              <div className="text-[#ffd875] font-semibold truncate max-w-[140px]">
                                {t.comments.length > 0 ? t.comments[t.comments.length - 1].author : t.author}
                              </div>
                              <div className="text-[11px] text-[#8c6b45]">{t.publishedAt}</div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            )}

            {/* ========================================================
                BẢNG 3: GIẢNG DẠY VÀ NGHIÊN CỨU
            ======================================================== */}
            {(selectedSection === 'all' || selectedSection === 'giang-day-nghien-cuu') && (
              <div className="border-2 border-[#b8933b]/80 rounded-2xl overflow-hidden shadow-2xl bg-[#140c06] space-y-0">
                {/* Header Mục 3 */}
                <div
                  className="px-4 py-2.5 border-b-2 border-[#b8933b]/80 flex items-center justify-between gap-2"
                  style={{
                    backgroundImage: "url('/assets/forum/i_back_title.png')",
                    backgroundRepeat: 'repeat-x',
                    backgroundColor: '#26170c'
                  }}
                >
                  <div className="flex items-center space-x-2">
                    <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-[#ffd875] to-[#8b6b23] text-black flex items-center justify-center font-black shadow shrink-0">
                      <GraduationCap className="w-4 h-4" />
                    </div>
                    <h2 className="font-black text-sm sm:text-base text-[#ffd875] tracking-wide uppercase">
                      3. Từ Gà Hóa Sói
                    </h2>
                  </div>
                </div>

                {/* KHUNG GIÁO TRÌNH 4 THẺ BÀI HỌC CỐT LÕI */}
                <div className="p-3 sm:p-4 bg-gradient-to-r from-[#1c1008] via-[#24140a] to-[#1c1008] border-b border-[#3b2310]">
                  {/* THANH TIẾN ĐỘ THÀNH VIÊN THEO LỘ TRÌNH 4 CẤP ĐỘ */}
                  <div className="mb-3 p-2.5 rounded-xl bg-[#140c06] border border-[#523317] flex items-center justify-between flex-wrap gap-2 text-xs">
                    <div className="flex items-center space-x-2">
                      <span className="font-bold text-[#fce8ba]">Hạng hiện tại:</span>
                      <span className="px-2.5 py-0.5 rounded bg-gradient-to-r from-[#ffd875] to-[#8b6b23] text-slate-950 font-black text-xs shadow flex items-center gap-1">
                        {currentUser?.wolfLevel === 4 ? '👑 Sói Đầu Đàn' : currentUser?.wolfLevel === 3 ? '⚔️ Sói Thực Chiến' : currentUser?.wolfLevel === 2 ? '🐺 Sói Tập Sự' : '🐣 Gà Mới Nhập Đàn'}
                      </span>
                      <span className="text-[#a68a56] hidden sm:inline">•</span>
                      <span className="text-[11px] text-[#ffd875] hidden sm:inline">
                        (Mở khóa: Cấp {currentUser?.wolfLevel || 1}/4)
                      </span>
                    </div>

                    <div className="text-[11px] text-[#c7ab77] flex items-center gap-1">
                      <span>*Giải đúng câu hỏi thực chiến của CLB để mở khóa cấp tiếp theo</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                    {/* CẤP 1: GÀ MỚI NHẬP ĐÀN */}
                    <div
                      onClick={() => handleOpenCurriculum('bai-viet-clb-00')}
                      className="bg-[#120a05] hover:bg-[#1a0f07] border-2 border-emerald-600/80 rounded-xl p-3 cursor-pointer transition-all group flex flex-col justify-between shadow-lg relative"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center justify-between text-[10px]">
                          <span className="font-black text-[#ffd875] uppercase">Cấp 1 🐣 Gà Mới Nhập Đàn</span>
                          <span className="text-emerald-400 font-bold bg-emerald-950/70 px-1.5 py-0.5 rounded border border-emerald-600 flex items-center gap-1">
                            <Unlock className="w-2.5 h-2.5 text-emerald-400" />
                            ĐÃ MỞ KHÓA
                          </span>
                        </div>
                        <h4 className="font-bold text-xs text-[#fce8ba] group-hover:text-[#ffd875] line-clamp-2">
                          [Bài 1] Nền Tảng & Luật Chơi Texas Hold'em
                        </h4>
                        <p className="text-[11px] text-[#a68a56] line-clamp-2">
                          Quyền Tố độc nhất, quy trình 4 vòng cược và thứ bậc bài 52 lá thực chiến.
                        </p>
                      </div>
                      <div className="mt-2 pt-2 border-t border-[#2d1b0d] flex items-center justify-between text-[11px] text-[#ffd875]">
                        <span className="flex items-center gap-1">
                          <BookOpen className="w-3 h-3 text-amber-500" />
                          Đọc sách & Thử thách #1
                        </span>
                        <span className="group-hover:translate-x-1 transition-transform">&rarr;</span>
                      </div>
                    </div>

                    {/* CẤP 2: SÓI TẬP SỰ */}
                    <div
                      onClick={() => {
                        if ((currentUser?.wolfLevel || 1) < 2) {
                          alert('🔒 Bạn cần giải đúng câu đố thực chiến của Cấp 1 (Lịch sử Poker) để mở khóa Cấp 2!');
                        }
                        handleOpenCurriculum('bai-viet-clb-01');
                      }}
                      className={`rounded-xl p-3 cursor-pointer transition-all group flex flex-col justify-between shadow-lg relative border-2 ${
                        (currentUser?.wolfLevel || 1) >= 2
                          ? 'bg-[#120a05] hover:bg-[#1a0f07] border-emerald-600/80'
                          : 'bg-[#140a04]/90 border-amber-800/60 opacity-90'
                      }`}
                    >
                      <div className="space-y-1">
                        <div className="flex items-center justify-between text-[10px]">
                          <span className="font-black text-[#ffd875] uppercase">Cấp 2 🐺 Sói Tập Sự</span>
                          {(currentUser?.wolfLevel || 1) >= 2 ? (
                            <span className="text-emerald-400 font-bold bg-emerald-950/70 px-1.5 py-0.5 rounded border border-emerald-600 flex items-center gap-1">
                              <Unlock className="w-2.5 h-2.5 text-emerald-400" />
                              ĐÃ MỞ KHÓA
                            </span>
                          ) : (
                            <span className="text-amber-400 font-bold bg-amber-950/70 px-1.5 py-0.5 rounded border border-amber-700 flex items-center gap-1">
                              <Lock className="w-2.5 h-2.5 text-amber-400" />
                              CẦN CẤP 1
                            </span>
                          )}
                        </div>
                        <h4 className="font-bold text-xs text-[#fce8ba] group-hover:text-[#ffd875] line-clamp-2">
                          Lối chơi TAG (Tight - Aggressive): Chặt chẽ & Tấn công
                        </h4>
                        <p className="text-[11px] text-[#a68a56] line-clamp-2">
                          Bảng phân bổ bài tẩy từng vị trí, C-bet và áp đặt thế chủ động cho học viên.
                        </p>
                      </div>
                      <div className="mt-2 pt-2 border-t border-[#2d1b0d] flex items-center justify-between text-[11px] text-[#ffd875]">
                        <span className="flex items-center gap-1">
                          <PlayCircle className="w-3 h-3 text-rose-500" />
                          Video #1 & Thử thách #2
                        </span>
                        <span className="group-hover:translate-x-1 transition-transform">&rarr;</span>
                      </div>
                    </div>

                    {/* CẤP 3: SÓI THỰC CHIẾN */}
                    <div
                      onClick={() => {
                        if ((currentUser?.wolfLevel || 1) < 3) {
                          alert('🔒 Bạn cần giải đúng câu đố thực chiến của Cấp 2 (Lối chơi TAG) để mở khóa Cấp 3!');
                        }
                        handleOpenCurriculum('bai-viet-clb-02');
                      }}
                      className={`rounded-xl p-3 cursor-pointer transition-all group flex flex-col justify-between shadow-lg relative border-2 ${
                        (currentUser?.wolfLevel || 1) >= 3
                          ? 'bg-[#120a05] hover:bg-[#1a0f07] border-emerald-600/80'
                          : 'bg-[#140a04]/90 border-amber-800/60 opacity-90'
                      }`}
                    >
                      <div className="space-y-1">
                        <div className="flex items-center justify-between text-[10px]">
                          <span className="font-black text-[#ffd875] uppercase">Cấp 3 ⚔️ Sói Thực Chiến</span>
                          {(currentUser?.wolfLevel || 1) >= 3 ? (
                            <span className="text-emerald-400 font-bold bg-emerald-950/70 px-1.5 py-0.5 rounded border border-emerald-600 flex items-center gap-1">
                              <Unlock className="w-2.5 h-2.5 text-emerald-400" />
                              ĐÃ MỞ KHÓA
                            </span>
                          ) : (
                            <span className="text-amber-400 font-bold bg-amber-950/70 px-1.5 py-0.5 rounded border border-amber-700 flex items-center gap-1">
                              <Lock className="w-2.5 h-2.5 text-amber-400" />
                              CẦN CẤP 2
                            </span>
                          )}
                        </div>
                        <h4 className="font-bold text-xs text-[#fce8ba] group-hover:text-[#ffd875] line-clamp-2">
                          Sit & Go (SNG) Toàn Tập: Chiến lược 4 giai đoạn & ICM
                        </h4>
                        <p className="text-[11px] text-[#a68a56] line-clamp-2">
                          Quản lý chip, cướp mù giữa trận, áp lực Bubble và kỹ thuật Heads-up.
                        </p>
                      </div>
                      <div className="mt-2 pt-2 border-t border-[#2d1b0d] flex items-center justify-between text-[11px] text-[#ffd875]">
                        <span className="flex items-center gap-1">
                          <PlayCircle className="w-3 h-3 text-rose-500" />
                          Video #2 & Thử thách #3
                        </span>
                        <span className="group-hover:translate-x-1 transition-transform">&rarr;</span>
                      </div>
                    </div>

                    {/* CẤP 4: SÓI ĐẦU ĐÀN */}
                    <div
                      onClick={() => {
                        if ((currentUser?.wolfLevel || 1) < 4) {
                          alert('🔒 Bạn cần giải đúng câu đố thực chiến của Cấp 3 (Sit & Go và ICM) để mở khóa Cấp 4 Sói Đầu Đàn!');
                        }
                        handleOpenCurriculum('bai-viet-clb-03');
                      }}
                      className={`rounded-xl p-3 cursor-pointer transition-all group flex flex-col justify-between shadow-lg relative border-2 ${
                        (currentUser?.wolfLevel || 1) >= 4
                          ? 'bg-[#120a05] hover:bg-[#1a0f07] border-[#ffd875]'
                          : 'bg-[#140a04]/90 border-amber-800/60 opacity-90'
                      }`}
                    >
                      <div className="space-y-1">
                        <div className="flex items-center justify-between text-[10px]">
                          <span className="font-black text-[#ffd875] uppercase">Cấp 4 👑 Sói Đầu Đàn</span>
                          {(currentUser?.wolfLevel || 1) >= 4 ? (
                            <span className="text-amber-300 font-bold bg-amber-950/70 px-1.5 py-0.5 rounded border border-[#ffd875] flex items-center gap-1">
                              <Unlock className="w-2.5 h-2.5 text-amber-300" />
                              ĐÃ MỞ KHÓA
                            </span>
                          ) : (
                            <span className="text-amber-400 font-bold bg-amber-950/70 px-1.5 py-0.5 rounded border border-amber-700 flex items-center gap-1">
                              <Lock className="w-2.5 h-2.5 text-amber-400" />
                              CẦN CẤP 3
                            </span>
                          )}
                        </div>
                        <h4 className="font-bold text-xs text-[#fce8ba] group-hover:text-[#ffd875] line-clamp-2">
                          Khung 4 Cấp độ: Từ Nhập môn đến Đọc hiểu tài liệu thế giới
                        </h4>
                        <p className="text-[11px] text-[#a68a56] line-clamp-2">
                          Lộ trình chuẩn hóa giúp học viên định vị và khai thác tài liệu Solver / 2+2.
                        </p>
                      </div>
                      <div className="mt-2 pt-2 border-t border-[#2d1b0d] flex items-center justify-between text-[11px] text-[#ffd875]">
                        <span className="flex items-center gap-1">
                          <BookOpen className="w-3 h-3 text-amber-500" />
                          Lộ trình & Thử thách #4
                        </span>
                        <span className="group-hover:translate-x-1 transition-transform">&rarr;</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Header Cột Bảng */}
                <div className="bg-[#1f130a] border-b border-[#3b2310] px-4 py-2 grid grid-cols-12 text-xs font-bold text-[#bfa06b] uppercase tracking-wider">
                  <div className="col-span-12 sm:col-span-7">Chủ đề & Bài học</div>
                  <div className="hidden sm:block sm:col-span-2 text-center">Thống kê</div>
                  <div className="hidden sm:block sm:col-span-3 text-right">Bài gửi mới nhất</div>
                </div>

                {/* Danh Sách Hàng Diễn Đàn Con Mục 3 */}
                <div className="divide-y divide-[#2e1c0e]">
                  {/* HÀNG DUY NHẤT: BỘ GIÁO TRÌNH ĐÀO TẠO CLB */}
                  <div
                    onClick={() => handleOpenCurriculum('bai-viet-clb-00')}
                    className="p-4 hover:bg-[#1f1209] cursor-pointer transition-colors grid grid-cols-12 gap-3 items-center bg-[#180e07]"
                  >
                    <div className="col-span-12 sm:col-span-7 flex items-start space-x-3">
                      <img
                        src="/assets/forum/i_folder_new_big.gif"
                        alt="Folder"
                        className="w-7 h-7 object-contain mt-1 shrink-0"
                      />
                      <div className="space-y-1.5">
                        <div className="flex items-center space-x-2 flex-wrap">
                          <span className="text-[10px] font-black px-2 py-0.5 rounded bg-[#8b6b23] text-black shrink-0 flex items-center gap-1 shadow-sm">
                            <GraduationCap className="w-3 h-3" />
                            GIÁO TRÌNH CLB
                          </span>
                          <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-[#2b190c] text-[#f5d77f] border border-[#543317]">
                            Lộ trình 4 Cấp độ
                          </span>
                          <h3 className="font-bold text-sm sm:text-base text-[#ffd875] hover:underline">
                            Giáo Trình Đào Tạo Nội Bộ (Lộ Trình Từ Gà Hóa Sói)
                          </h3>
                        </div>

                        <p className="text-xs text-[#c4aa7d]">
                          Tổng hợp toàn bộ kiến thức thực chiến: Luật chơi Texas Hold'em, Phong cách TAG chặt chẽ, Chiến lược Sit & Go và Khóa luận GTO.
                        </p>
                      </div>
                    </div>

                    <div className="col-span-6 sm:col-span-2 text-left sm:text-center text-xs text-[#a68a56]">
                      <div className="font-bold text-[#fce8ba]">4 Cấp độ chuẩn</div>
                      <div className="text-[11px]">88 thảo luận</div>
                    </div>

                    <div className="col-span-6 sm:col-span-3 text-right text-xs">
                      <div className="flex items-center justify-end space-x-2">
                        <img
                          src="/assets/forum/avatar_tidu.jpg"
                          alt="Tidu Avatar"
                          className="w-7 h-7 rounded object-cover border border-[#b8933b]"
                        />
                        <div className="text-right">
                          <div className="font-bold text-[#fce8ba] hover:underline">Giáo trình đào tạo</div>
                          <div className="text-[11px] text-[#8c6b45]">bởi <strong>Tidu</strong> (Giảng viên)</div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Các bài nghiên cứu chuyên môn / phân tích khác thuộc Mục 3 */}
                  {threads
                    .filter((t) => t.mainSection === 'giang-day-nghien-cuu' && t.category !== 'giao-trinh-clb' && t.id !== 'bai-viet-00')
                    .map((t) => (
                      <div
                        key={t.id}
                        onClick={() => handleOpenThread(t)}
                        className="p-3.5 sm:p-4 hover:bg-[#1f1209] cursor-pointer transition-colors grid grid-cols-12 gap-3 items-center"
                      >
                        <div className="col-span-12 sm:col-span-7 flex items-start space-x-3">
                          <img
                            src="/assets/forum/i_folder_big.png"
                            alt="Folder"
                            className="w-5 h-5 sm:w-6 sm:h-6 object-contain mt-0.5 shrink-0"
                          />
                          <div className="space-y-1">
                            <div className="flex items-center space-x-2 flex-wrap">
                              {t.category === 'giao-trinh-clb' ? (
                                <span className="text-[10px] font-black px-2 py-0.5 rounded bg-[#8b6b23] text-black shrink-0 flex items-center gap-1 shadow-sm">
                                  <GraduationCap className="w-3 h-3" />
                                  GIÁO TRÌNH CLB
                                </span>
                              ) : (
                                <span className="text-[10px] font-black px-2 py-0.5 rounded bg-purple-950 text-purple-300 border border-purple-700 shrink-0">
                                  NGHIÊN CỨU GTO
                                </span>
                              )}
                              <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-[#2b190c] text-[#f5d77f] border border-[#543317]">
                                {t.subForum}
                              </span>
                              <h4 className="font-bold text-sm text-[#f0d8a8] hover:text-[#ffd875] transition-colors">
                                {t.title}
                              </h4>
                            </div>
                            <p className="text-xs text-[#a68a56] line-clamp-1">{t.summary}</p>
                            <div className="flex items-center space-x-2 text-[11px] text-[#8c6b45] flex-wrap gap-y-1">
                              <span className="flex items-center gap-1.5">
                                <span>Tác giả:</span>
                                <strong className="text-[#fce8ba]">{t.author}</strong>
                                {renderUserRankBadge({
                                  username: t.author,
                                  role: t.authorRole,
                                  roleGroup: t.author === 'Tidu' ? 'special' : 'athlete',
                                  specialRole: t.author === 'Tidu' ? 'coach' : undefined,
                                  starLevel: t.author === 'Tidu' ? undefined : (t.authorRole === 'Biên tập' ? 4 : 2)
                                })}
                              </span>
                              <span>•</span>
                              <div>{renderRoleBadge(t.authorRole)}</div>
                              {t.pdfUrl && (
                                <span className="px-1.5 py-0.2 bg-red-950 text-red-300 border border-red-800 rounded text-[9px] font-bold">
                                  PDF Sách 2016
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="col-span-6 sm:col-span-2 text-left sm:text-center text-xs text-[#a68a56]">
                          <div className="font-bold text-[#fce8ba]">{t.replies} trả lời</div>
                          <div className="text-[11px]">{t.views} xem</div>
                        </div>

                        <div className="col-span-6 sm:col-span-3 text-right text-xs text-[#a68a56]">
                          <div className="flex items-center justify-end space-x-2">
                            {t.author === 'Tidu' && (
                              <img
                                src="/assets/forum/avatar_tidu.jpg"
                                alt="Tidu Avatar"
                                className="w-6 h-6 rounded object-cover border border-[#b8933b]"
                              />
                            )}
                            <div className="text-right">
                              <div className="text-[#ffd875] font-semibold truncate max-w-[140px]">
                                {t.comments.length > 0 ? t.comments[t.comments.length - 1].author : t.author}
                              </div>
                              <div className="text-[11px] text-[#8c6b45]">{t.publishedAt}</div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            )}
            </div>

            {/* BẢNG THỐNG KÊ TOÀN DIỄN ĐÀN (STATISTICS BOX - SỐ LIỆU THỰC TẾ 100%) */}
            <div className="border border-[#472d16] rounded-xl overflow-hidden shadow-xl bg-[#140c06] p-4 space-y-3">
              <div className="flex items-center justify-between border-b border-[#3b2310] pb-2 flex-wrap gap-2">
                <div className="flex items-center space-x-2 text-xs font-bold text-[#fce8ba]">
                  <BarChart3 className="w-4 h-4 text-[#e6b84d]" />
                  <span>THỐNG KÊ HOẠT ĐỘNG DIỄN ĐÀN CHƠI POKER</span>
                </div>
                <span className="text-[11px] text-emerald-400 font-semibold flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  Số liệu thực tế thời gian thực
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center text-xs">
                <div className="p-2.5 bg-[#0f0804] rounded-lg border border-[#331e0e]">
                  <div className="text-lg font-black text-[#f5d77f]">{stats?.totalThreads ?? threads.length}</div>
                  <div className="text-[11px] text-[#a68a56]">Chủ đề bài viết</div>
                </div>
                <div className="p-2.5 bg-[#0f0804] rounded-lg border border-[#331e0e]">
                  <div className="text-lg font-black text-emerald-400">
                    {stats?.totalPosts ?? threads.reduce((acc, t) => acc + 1 + t.comments.length + (t.proInteractions?.length || 0), 0)}
                  </div>
                  <div className="text-[11px] text-[#a68a56]">Tổng bài & thảo luận</div>
                </div>
                <div className="p-2.5 bg-[#0f0804] rounded-lg border border-[#331e0e]">
                  <div className="text-lg font-black text-blue-400">{stats?.totalMembers ?? 1}</div>
                  <div className="text-[11px] text-[#a68a56]">Thành viên đã đăng ký</div>
                </div>
                <div className="p-2.5 bg-[#0f0804] rounded-lg border border-[#331e0e]">
                  <div className="text-lg font-black text-purple-400">{stats?.onlineMembers ?? 1}</div>
                  <div className="text-[11px] text-[#a68a56]">Đang online thực tế</div>
                </div>
              </div>

              {currentUser && (
                <div className="p-2.5 rounded-lg bg-[#0d1610] border border-emerald-800/60 text-[11px] text-emerald-200 flex flex-wrap items-center justify-between gap-2">
                  <span>
                    📊 <strong>Báo cáo thực tế cho {currentUser.username}:</strong> Tổng <strong>{stats?.totalMembers ?? 1}</strong> tài khoản (gồm Admin <strong>Tidu</strong> + <strong>{stats?.newRegisteredCount ?? 0}</strong> thành viên đăng ký mới).
                  </span>
                  <span>
                    🟢 Đang trực tuyến ({stats?.onlineMembers ?? 1}): <strong>{stats?.onlineUsers?.join(', ') || currentUser.username}</strong>
                  </span>
                </div>
              )}

              <div className="flex flex-wrap items-center gap-3 text-xs text-[#a68a56] pt-1 border-t border-[#331e0e]">
                <span className="font-bold text-[#d1ba88]">Cộng đồng học thuật:</span>
                <span className="text-[#f5d77f] font-bold">[ Giảng viên: Tidu ]</span>
                <span className="text-blue-400 font-bold">[ Biên tập viên ]</span>
                <span className="text-emerald-400 font-semibold">[ Học viên ]</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ========================================================
          MODAL LỰA CHỌN MẪU LOGO ĐÃ THIẾT KẾ LẠI
      ======================================================== */}
      {showLogoModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
          <div className="bg-[#170e08] border-2 border-[#54361b] rounded-2xl max-w-2xl w-full p-6 shadow-2xl relative space-y-4">
            <button
              onClick={() => setShowLogoModal(false)}
              className="absolute top-4 right-4 text-[#8c6b45] hover:text-white p-1 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center space-x-2 text-[#f5d77f] text-xs font-bold uppercase">
              <Palette className="w-4 h-4" />
              <span>Thiết Kế Lại Nhận Diện Logo "Chơi Poker"</span>
            </div>
            <h3 className="text-lg font-bold text-white">
              Chọn Mẫu Logo Yêu Thích Của Bạn
            </h3>
            <p className="text-xs text-[#a68a56]">
              Dựa trên ý tưởng biểu tượng bàn tay chỉ súng giữ lá bài Chuồn (♣) của bạn, tôi đã tạo ra các biến thể 3D độ phân giải cao và cực kỳ sang trọng:
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-1">
              {/* Mẫu 1: Vàng Kim 24K & Obsidian (Khuyên dùng) */}
              <div
                onClick={() => handleSelectLogo('gold-redesign')}
                className={`p-3 rounded-xl border transition-all cursor-pointer bg-[#0f0804] flex flex-col justify-between space-y-2.5 ${
                  logoStyle === 'gold-redesign'
                    ? 'border-[#b8933b] ring-2 ring-[#b8933b]/40'
                    : 'border-[#382312] hover:border-[#694220]'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[#f5d77f]">Mẫu 1: Vàng 24K & Obsidian (Khuyên Dùng)</span>
                  {logoStyle === 'gold-redesign' && (
                    <span className="p-0.5 rounded-full bg-[#b8933b] text-black">
                      <Check className="w-3 h-3 stroke-[3]" />
                    </span>
                  )}
                </div>
                <div className="bg-black/60 p-2 rounded-lg border border-[#2b180a] flex items-center justify-center">
                  <img
                    src="/assets/forum/logo_variant1_gold.jpg"
                    alt="Logo Gold Redesign"
                    className="max-h-24 w-auto rounded object-contain"
                  />
                </div>
                <p className="text-[11px] text-[#a68a56]">
                  Găng tay da đen nổi khối 3D, lá bài chuồn vàng 24K dập nổi sang trọng và chữ "Chơi Poker" bằng vàng bóng loáng.
                </p>
              </div>

              {/* Mẫu 2: Bạch Kim Chrome & Chuồn Phát Sáng */}
              <div
                onClick={() => handleSelectLogo('chrome-redesign')}
                className={`p-3 rounded-xl border transition-all cursor-pointer bg-[#0f0804] flex flex-col justify-between space-y-2.5 ${
                  logoStyle === 'chrome-redesign'
                    ? 'border-[#b8933b] ring-2 ring-[#b8933b]/40'
                    : 'border-[#382312] hover:border-[#694220]'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-200">Mẫu 2: Championship Chrome & Gold</span>
                  {logoStyle === 'chrome-redesign' && (
                    <span className="p-0.5 rounded-full bg-[#b8933b] text-black">
                      <Check className="w-3 h-3 stroke-[3]" />
                    </span>
                  )}
                </div>
                <div className="bg-black/60 p-2 rounded-lg border border-[#2b180a] flex items-center justify-center">
                  <img
                    src="/assets/forum/logo_variant2_chrome.jpg"
                    alt="Logo Chrome Redesign"
                    className="max-h-24 w-auto rounded object-contain"
                  />
                </div>
                <p className="text-[11px] text-[#a68a56]">
                  Phong cách kim loại Titanium hiện đại, biểu tượng Chuồn phát sáng rực rỡ, phù hợp đấu giải đẳng cấp.
                </p>
              </div>

              {/* Mẫu 3: Bản Gốc Phác Thảo Của Bạn */}
              <div
                onClick={() => handleSelectLogo('user-sketch')}
                className={`p-3 rounded-xl border transition-all cursor-pointer bg-[#0f0804] flex flex-col justify-between space-y-2.5 ${
                  logoStyle === 'user-sketch'
                    ? 'border-[#b8933b] ring-2 ring-[#b8933b]/40'
                    : 'border-[#382312] hover:border-[#694220]'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[#c4aa7d]">Mẫu 3: Bản Gốc Bạn Vừa Tải Lên</span>
                  {logoStyle === 'user-sketch' && (
                    <span className="p-0.5 rounded-full bg-[#b8933b] text-black">
                      <Check className="w-3 h-3 stroke-[3]" />
                    </span>
                  )}
                </div>
                <div className="bg-black/60 p-2 rounded-lg border border-[#2b180a] flex items-center justify-center">
                  <img
                    src="/assets/forum/logo_original_user.png"
                    alt="Logo User Original"
                    className="max-h-24 w-auto object-contain filter drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)]"
                  />
                </div>
                <p className="text-[11px] text-[#a68a56]">
                  Giữ nguyên hình ảnh phác thảo đen trắng bạn vừa cung cấp.
                </p>
              </div>

              {/* Mẫu 4: Logo Web ForumVi Cũ */}
              <div
                onClick={() => handleSelectLogo('classic-forumvi')}
                className={`p-3 rounded-xl border transition-all cursor-pointer bg-[#0f0804] flex flex-col justify-between space-y-2.5 ${
                  logoStyle === 'classic-forumvi'
                    ? 'border-[#b8933b] ring-2 ring-[#b8933b]/40'
                    : 'border-[#382312] hover:border-[#694220]'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[#a68a56]">Mẫu 4: Logo ForumVi Truyền Thống</span>
                  {logoStyle === 'classic-forumvi' && (
                    <span className="p-0.5 rounded-full bg-[#b8933b] text-black">
                      <Check className="w-3 h-3 stroke-[3]" />
                    </span>
                  )}
                </div>
                <div className="bg-black/60 p-2 rounded-lg border border-[#2b180a] flex items-center justify-center">
                  <img
                    src="/assets/forum/logo14.jpg"
                    alt="Logo Classic ForumVi"
                    className="max-h-24 w-auto rounded object-contain border border-[#4a3219]"
                  />
                </div>
                <p className="text-[11px] text-[#a68a56]">
                  Logo hình chữ nhật truyền thống trên website hocpoker.forumvi.com cũ.
                </p>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setShowLogoModal(false)}
                className="px-5 py-2 rounded-xl bg-[#8b6b23] hover:bg-[#a6822e] text-black font-black text-xs transition-colors cursor-pointer shadow"
              >
                Xác Nhận Lựa Chọn
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL TRỢ LÝ AI CỐ VẤN (YÊU CẦU SUBSCRIBE YOUTUBE @CHOIPOKER HOẶC QUÉT MÃ VIETQR) */}
      {showAiModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-[#170e08] border-2 border-[#54361b] rounded-2xl max-w-lg w-full p-5 shadow-2xl relative space-y-3">
            <button
              onClick={() => setShowAiModal(false)}
              className="absolute top-4 right-4 text-[#8c6b45] hover:text-white p-1 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center space-x-2 text-[#f5d77f] text-xs font-bold uppercase">
              <Bot className="w-4 h-4" />
              <span>Cố Vấn Chiến Thuật Poker AI (100% Tiếng Việt)</span>
            </div>
            <p className="text-xs text-[#a68a56]">
              Giải đáp luật chơi, thế bài, tỷ lệ cược (Pot Odds) hoặc thuật ngữ Texas Hold'em.
            </p>

            {!hasActiveSubscription() && !(commentsUnlockSession && commentsUnlockSession.expiresAt > Date.now()) ? (
              <div className="p-4 rounded-xl bg-gradient-to-br from-[#1b0f06] to-[#0f0803] border border-amber-500/70 space-y-3">
                <div className="text-xs font-black text-[#ffd875] flex items-center gap-1.5">
                  <Lock className="w-4 h-4 text-amber-400 shrink-0" />
                  <span>ĐẶC QUYỀN CỐ VẤN AI & KHUYẾN NGHỊ THỰC CHIẾN</span>
                </div>
                <p className="text-[11px] text-[#e6cb9c] leading-relaxed">
                  Tính năng <strong>Cố Vấn Chiến Thuật AI</strong> dành riêng cho thành viên ủng hộ CLB. Quý Cao thủ vui lòng <strong>Xem video tài trợ 1 phút (60s)</strong> hoặc <strong>Quét mã VietQR (Từ 5k cốc trà đá / Hội viên)</strong> để mở khóa ngay nhé!
                </p>
                <div className="flex flex-col sm:flex-row gap-2 pt-1">
                  <a
                    href="https://www.youtube.com/@choipoker?sub_confirmation=1"
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => {
                      setShowAiModal(false);
                      handleOpenUnlockCommentsModal();
                      setActiveYoutubeIdx(0);
                      setAdSecondsLeft(AD_COMMENTS_DURATION_SECONDS);
                      setAdPlaying(true);
                    }}
                    className="flex-1 py-2.5 px-3 rounded-xl bg-red-600 hover:bg-red-500 text-white font-black text-xs text-center shadow-lg cursor-pointer transition"
                  >
                    🔔 Subscribe YouTube @choipoker
                  </a>
                  <button
                    type="button"
                    onClick={() => {
                      setShowAiModal(false);
                      handleOpenUnlockCommentsModal();
                    }}
                    className="flex-1 py-2.5 px-3 rounded-xl bg-gradient-to-r from-[#ffd875] to-[#8b6b23] text-slate-950 font-black text-xs shadow-lg cursor-pointer transition"
                  >
                    ⚡ Quét Mã VietQR Mở Khóa
                  </button>
                </div>
              </div>
            ) : (
              <>
                <form onSubmit={handleAskAi} className="space-y-3">
                  <textarea
                    value={aiQuestion}
                    onChange={(e) => setAiQuestion(e.target.value)}
                    placeholder="Ví dụ: Khi nào nên tố thêm lần 3 (3-bet)? Hoặc: Tỷ lệ Pot Odds được tính thế nào?"
                    rows={3}
                    className="w-full bg-[#0d0703] border border-[#3d2712] rounded-lg p-2.5 text-xs text-[#fce8ba] placeholder-[#8c6b45] focus:outline-none focus:border-[#b8933b]"
                  />
                  <button
                    type="submit"
                    disabled={aiLoading || !aiQuestion.trim()}
                    className="w-full py-2 rounded-lg bg-[#8b6b23] hover:bg-[#a6822e] text-slate-950 text-xs font-bold transition-all disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer shadow"
                  >
                    {aiLoading ? 'Đang suy luận...' : 'Gửi Câu Hỏi Cho Cố Vấn AI'}
                  </button>
                </form>

                {aiResponse && (
                  <div className="p-3.5 bg-[#0d0703] border border-[#3d2712] rounded-lg space-y-1.5 max-h-56 overflow-y-auto">
                    <div className="text-xs font-bold text-[#f5d77f]">Cố Vấn Diễn Đàn Trả Lời:</div>
                    <div className="text-xs text-[#f0dfc0] whitespace-pre-wrap leading-relaxed">
                      {aiResponse}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      )}

      {/* MODAL ĐĂNG KÝ / ĐĂNG NHẬP THÀNH VIÊN VÀ HỌC VIỆN */}
      {showAuthModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
          <div className="bg-[#170e08] border-2 border-[#b8933b]/80 rounded-2xl max-w-md w-full p-5 sm:p-6 shadow-2xl relative space-y-4">
            <button
              onClick={() => setShowAuthModal(false)}
              className="absolute top-4 right-4 text-[#8c6b45] hover:text-white p-1 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Header Modal */}
            <div className="text-center space-y-1">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#ffd875] to-[#8b6b23] text-black flex items-center justify-center mx-auto mb-2 shadow-lg font-black text-xl">
                🐺
              </div>
              <h3 className="text-lg font-black text-[#fce8ba]">Hệ Thống Thành Viên & Học Viện CLB</h3>
              <p className="text-xs text-[#a68a56]">choipoker.vercel.app • Lộ Trình Từ Gà Hóa Sói</p>
            </div>

            {/* Tabs Đăng Nhập vs Đăng Ký */}
            <div className="flex rounded-xl bg-[#0d0703] p-1 border border-[#3d2712]">
              <button
                type="button"
                onClick={() => setAuthMode('login')}
                className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  authMode === 'login'
                    ? 'bg-[#8b6b23] text-slate-950 shadow'
                    : 'text-[#d1ba88] hover:text-[#ffd875]'
                }`}
              >
                Đăng Nhập
              </button>
              <button
                type="button"
                onClick={() => setAuthMode('register')}
                className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  authMode === 'register'
                    ? 'bg-[#8b6b23] text-slate-950 shadow'
                    : 'text-[#d1ba88] hover:text-[#ffd875]'
                }`}
              >
                Đăng Ký Mới
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleRegisterOrLogin} className="space-y-3.5">
              <div>
                <label className="text-xs font-bold text-[#c4aa7d] block mb-1">
                  {authMode === 'login' ? 'Tên đăng nhập / Học viên:' : 'Tên tài khoản thành viên mới:'}
                </label>
                <input
                  type="text"
                  value={regUsername}
                  onChange={(e) => setRegUsername(e.target.value)}
                  placeholder="Ví dụ: Tidu, Hoang_MTT, Sói_Hà_Nội..."
                  className="w-full bg-[#0d0703] border border-[#3d2712] rounded-xl px-3 py-2 text-xs text-[#fce8ba] focus:outline-none focus:border-[#ffd875]"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-[#c4aa7d] block mb-1">Vai trò trong diễn đàn:</label>
                <select
                  value={regRole}
                  onChange={(e) => setRegRole(e.target.value as any)}
                  className="w-full bg-[#0d0703] border border-[#3d2712] rounded-xl px-3 py-2 text-xs text-[#fce8ba] focus:outline-none focus:border-[#ffd875]"
                >
                  <option value="Học viên">Học viên CLB</option>
                  <option value="Biên tập">Biên tập viên (Trạm tình báo)</option>
                  <option value="Giảng viên">Giảng viên (Founder Tidu)</option>
                </select>
              </div>

              {/* Huy Hiệu Cấp Bậc Khởi Đầu */}
              <div className="p-3 rounded-xl bg-[#0f0905] border border-[#3b2310] space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-[#d1ba88]">Huy hiệu cấp bậc:</span>
                  {renderWolfBadge(regRole === 'Giảng viên' || regUsername.toLowerCase() === 'tidu' ? 4 : 1, regRole === 'Giảng viên' || regUsername.toLowerCase() === 'tidu' ? 'Sói Đầu Đàn' : 'Gà Mới')}
                </div>
                <p className="text-[11px] text-[#8c6b45] leading-relaxed">
                  {regRole === 'Giảng viên' || regUsername.toLowerCase() === 'tidu'
                    ? '👑 Cấp 4: Có toàn quyền thẩm định giáo trình và phán quyết.'
                    : '🐣 Cần hoàn thành bài kiểm tra tình huống thực tế ở cuối mỗi chặng trong mục "Lò Luyện Từ Gà Hóa Sói" để được mở khóa cấp độ săn mồi tiếp theo!'}
                </p>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 rounded-xl bg-gradient-to-r from-[#ffd875] to-[#8b6b23] hover:from-[#ffe299] hover:to-[#a6822e] text-slate-950 text-xs font-black transition-all cursor-pointer shadow-lg"
              >
                {authMode === 'login' ? 'Đăng Nhập Ngay' : 'Đăng Ký & Vào Học Viện CLB'}
              </button>
            </form>

            {/* Tài Khoản Nhanh / Demo Switcher */}
            <div className="pt-2 border-t border-[#2e1c0e] space-y-2">
              <span className="text-[10px] font-bold text-[#8c6b45] uppercase tracking-wider block text-center">
                Chọn tài khoản mẫu để trải nghiệm 2 nhóm danh tính & các mức sao:
              </span>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => handleQuickLogin('Tidu', 'Giảng viên', 4, 'Sói Đầu Đàn', '/assets/forum/avatar_tidu.jpg', 'special', 'coach')}
                  className="p-2 rounded-lg bg-[#0d0703] hover:bg-[#1a0f07] border border-[#ffd875]/40 text-left text-[11px] cursor-pointer flex items-center gap-1.5"
                >
                  <span className="text-base">🐺</span>
                  <div>
                    <div className="font-bold text-[#ffd875]">Tidu (Giảng Viên / Coach)</div>
                    <div className="text-[10px] text-amber-400">Nhóm Đặc Biệt (Không sao)</div>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => handleQuickLogin('Admin_CLB', 'Giảng viên', 4, 'Sói Đầu Đàn', 'bg-red-600', 'special', 'admin')}
                  className="p-2 rounded-lg bg-[#0d0703] hover:bg-[#1a0f07] border border-red-500/40 text-left text-[11px] cursor-pointer flex items-center gap-1.5"
                >
                  <span className="text-base">👑</span>
                  <div>
                    <div className="font-bold text-red-400">Admin / Chủ Nhiệm CLB</div>
                    <div className="text-[10px] text-red-300">Nhóm Đặc Biệt (Không sao)</div>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => handleQuickLogin('BanCoVan', 'Biên tập', 3, 'Sói Thực Chiến', 'bg-emerald-600', 'special', 'advisor')}
                  className="p-2 rounded-lg bg-[#0d0703] hover:bg-[#1a0f07] border border-emerald-500/40 text-left text-[11px] cursor-pointer flex items-center gap-1.5"
                >
                  <span className="text-base">⚖️</span>
                  <div>
                    <div className="font-bold text-emerald-300">AI Trọng Tài / Cố Vấn</div>
                    <div className="text-[10px] text-emerald-400">Nhóm Đặc Biệt (Không sao)</div>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => handleQuickLogin('Hoang_MTT', 'Học viên', 3, 'Sói Thực Chiến', 'bg-blue-600', 'athlete', undefined, 4)}
                  className="p-2 rounded-lg bg-[#0d0703] hover:bg-[#1a0f07] border border-rose-500/40 text-left text-[11px] cursor-pointer flex items-center gap-1.5"
                >
                  <span className="text-xs text-amber-400 font-serif">★★★★</span>
                  <div>
                    <div className="font-bold text-amber-300">Hoang_MTT (4 Sao)</div>
                    <div className="text-[10px] text-[#8c6b45]">Verify SharkScope & Hendon</div>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => handleQuickLogin('Tran_CashPro', 'Học viên', 2, 'Sói Tập Sự', 'bg-emerald-600', 'athlete', undefined, 3)}
                  className="p-2 rounded-lg bg-[#0d0703] hover:bg-[#1a0f07] border border-blue-500/40 text-left text-[11px] cursor-pointer flex items-center gap-1.5"
                >
                  <span className="text-xs text-amber-400 font-serif">★★★</span>
                  <div>
                    <div className="font-bold text-amber-300">Tran_CashPro (3 Sao)</div>
                    <div className="text-[10px] text-[#8c6b45]">Verify PT4 & SmartHand</div>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => handleQuickLogin('HocVien_Moi', 'Học viên', 1, 'Gà Mới Nhập Đàn', 'bg-amber-600', 'athlete', undefined, 0)}
                  className="p-2 rounded-lg bg-[#0d0703] hover:bg-[#1a0f07] border border-amber-600/40 text-left text-[11px] cursor-pointer flex items-center gap-1.5"
                >
                  <span className="text-base text-zinc-400">☆</span>
                  <div>
                    <div className="font-bold text-amber-300">Học Viên Mới (0 Sao)</div>
                    <div className="text-[10px] text-[#8c6b45]">Chưa xác thực (☆ 0 Sao)</div>
                  </div>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================
          MODAL HỒ SƠ VẬN ĐỘNG VIÊN & XÁC THỰC THỰC LỰC (4 CỔNG DỮ LIỆU)
      ======================================================== */}
      {showProfileModal && currentUser && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-fade-in">
          <div className="bg-gradient-to-b from-[#140c06] via-[#1a0f07] to-[#120a05] border-2 border-amber-600/80 rounded-2xl max-w-4xl w-full p-4 sm:p-6 shadow-2xl space-y-5 my-8 max-h-[92vh] overflow-y-auto border-t-amber-500">
            {/* Header Modal */}
            <div className="flex items-center justify-between border-b border-[#3d2712] pb-3">
              <div className="flex items-center space-x-2.5">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#ffd875] to-[#8b6b23] text-black flex items-center justify-center font-black shadow-md shrink-0">
                  <ShieldCheck className="w-5 h-5 text-black" />
                </div>
                <div>
                  <h3 className="font-black text-base sm:text-lg text-[#ffd875] tracking-wide flex items-center gap-2">
                    <span>HỒ SƠ VẬN ĐỘNG VIÊN & XÁC THỰC THỰC LỰC</span>
                  </h3>
                  <p className="text-[11px] text-[#a68a56]">
                    Phân cấp 2 nhóm độc lập: VĐV (0-6 Sao) & Nhóm Đặc Biệt (Admin 👑, Giảng Viên 🎓, Ban Cố Vấn ⚖️)
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setShowProfileModal(false)}
                className="w-8 h-8 rounded-lg bg-[#24150a] hover:bg-[#38210f] text-[#d1ba88] hover:text-white flex items-center justify-center transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Thông Báo Lưu Thành Công */}
            {profileSavedToast && (
              <div className="p-3 rounded-xl bg-emerald-950/90 border border-emerald-500 text-emerald-200 text-xs font-bold flex items-center gap-2 animate-fade-in shadow-lg">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Đã lưu thông tin hồ sơ và cập nhật trạng thái xét duyệt thành công!</span>
              </div>
            )}

            {/* Thẻ Tổng Quan Tài Khoản & Cấp Bậc Hiện Tại */}
            <div className="p-4 rounded-xl bg-[#0d0703] border border-[#3b2310] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center space-x-3.5">
                {currentUser.avatar.startsWith('/') ? (
                  <img
                    src={currentUser.avatar}
                    alt={currentUser.username}
                    className="w-14 h-14 rounded-2xl object-cover border-2 border-[#b8933b] shadow-lg"
                  />
                ) : (
                  <div className={`w-14 h-14 rounded-2xl ${currentUser.avatar} flex items-center justify-center text-xl text-black font-black shadow-lg`}>
                    {currentUser.username[0]}
                  </div>
                )}
                <div className="space-y-1">
                  <div className="flex items-center space-x-2 flex-wrap gap-y-1">
                    <h4 className="font-black text-base text-[#fce8ba]">{currentUser.username}</h4>
                    {renderUserRankBadge(currentUser)}
                  </div>
                  <p className="text-xs text-[#a68a56]">{currentUser.email}</p>
                  <div className="flex items-center space-x-2 text-[11px] text-[#8c6b45]">
                    <span>Hạng Học Viện: <strong className="text-[#ffd875]">{currentUser.wolfTitle || 'Gà Mới'}</strong></span>
                  </div>
                </div>
              </div>

              {/* Chuyển Đổi Nhóm & Sao Để Trải Nghiệm / Cấu Hình */}
              <div className="p-3 rounded-xl bg-[#140c06] border border-[#3d2712] space-y-2 text-xs">
                <div className="flex items-center justify-between gap-2">
                  <span className="font-bold text-[#d1ba88]">Chọn nhóm danh tính:</span>
                  <div className="flex rounded-lg bg-[#0d0703] p-0.5 border border-[#3d2712]">
                    <button
                      type="button"
                      onClick={() => setEditRoleGroup('athlete')}
                      className={`px-2 py-0.5 rounded text-[11px] font-bold transition-all cursor-pointer ${
                        editRoleGroup === 'athlete'
                          ? 'bg-[#8b6b23] text-black shadow'
                          : 'text-[#a68a56] hover:text-white'
                      }`}
                    >
                      Vận Động Viên (Hệ Sao)
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditRoleGroup('special')}
                      className={`px-2 py-0.5 rounded text-[11px] font-bold transition-all cursor-pointer ${
                        editRoleGroup === 'special'
                          ? 'bg-rose-700 text-white shadow'
                          : 'text-[#a68a56] hover:text-white'
                      }`}
                    >
                      Nhóm Đặc Biệt (Không Sao)
                    </button>
                  </div>
                </div>

                {editRoleGroup === 'special' ? (
                  <div className="flex items-center gap-1.5 flex-wrap pt-1">
                    <span className="text-[11px] text-[#8c6b45]">Vai trò:</span>
                    <button
                      type="button"
                      onClick={() => setEditSpecialRole('admin')}
                      className={`px-2 py-0.5 rounded text-[11px] font-black cursor-pointer transition ${
                        editSpecialRole === 'admin'
                          ? 'bg-red-600 text-white shadow'
                          : 'bg-[#0d0703] text-red-400 border border-red-800'
                      }`}
                    >
                      👑 Admin / Chủ nhiệm CLB
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditSpecialRole('coach')}
                      className={`px-2 py-0.5 rounded text-[11px] font-black cursor-pointer transition ${
                        editSpecialRole === 'coach'
                          ? 'bg-amber-600 text-black shadow'
                          : 'bg-[#0d0703] text-amber-400 border border-amber-800'
                      }`}
                    >
                      🐺 Giảng viên (Coach)
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditSpecialRole('advisor')}
                      className={`px-2 py-0.5 rounded text-[11px] font-black cursor-pointer transition ${
                        editSpecialRole === 'advisor'
                          ? 'bg-emerald-600 text-white shadow'
                          : 'bg-[#0d0703] text-emerald-400 border border-emerald-800'
                      }`}
                    >
                      ⚖️ AI Trọng Tài / Chuyên gia
                    </button>
                  </div>
                ) : (
                  <div className="space-y-1 pt-1">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-[#a68a56]">Cấp bậc sao VĐV:</span>
                      <strong className="text-amber-400 font-mono">
                        {editStarLevel === 0
                          ? '☆ 0 Sao (Chưa xác thực)'
                          : `${'★'.repeat(editStarLevel)} (${editStarLevel} Sao)`}
                      </strong>
                    </div>
                    <div className="flex items-center gap-1 flex-wrap">
                      {([0, 1, 2, 3, 4, 5, 6] as StarLevel[]).map((lvl) => (
                        <button
                          key={lvl}
                          type="button"
                          onClick={() => setEditStarLevel(lvl)}
                          className={`px-2 py-1 rounded text-xs font-black cursor-pointer transition ${
                            editStarLevel === lvl
                              ? 'bg-gradient-to-r from-[#ffd875] to-[#8b6b23] text-black shadow-md'
                              : 'bg-[#0d0703] text-[#a68a56] border border-[#3b2310] hover:text-white'
                          }`}
                        >
                          {lvl === 0 ? '☆ 0' : `${'★'.repeat(lvl)} ${lvl}`}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Form 4 Cổng Xác Thực */}
            <form onSubmit={handleSaveProfile} className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-black text-[#ffd875] uppercase tracking-wider flex items-center gap-2">
                  <Flame className="w-4 h-4 text-amber-400" />
                  <span>XÁC THỰC TRÌNH ĐỘ THỰC CHIẾN</span>
                </h4>
                <span className="text-[11px] text-[#8c6b45] italic hidden sm:inline">
                  *Cung cấp link hoặc dữ liệu để Ban Cố Vấn & Admin thẩm định
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* CỔNG 1: TRA CỨU NICKNAME ONLINE */}
                <div className="p-4 rounded-xl bg-[#0d0703] border-2 border-sky-800/60 space-y-3 shadow-lg">
                  <div className="flex items-center justify-between border-b border-sky-950 pb-2">
                    <div className="flex items-center space-x-2">
                      <div className="w-7 h-7 rounded-lg bg-sky-950 text-sky-400 border border-sky-700 flex items-center justify-center font-bold">
                        <Globe2 className="w-4 h-4" />
                      </div>
                      <span className="font-black text-xs text-sky-200 uppercase">
                        (1) Nickname & Link SharkScope/OPR cho Online Tour
                      </span>
                    </div>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${vSharkscopeVerified ? 'bg-emerald-950 text-emerald-300 border-emerald-600' : 'bg-amber-950 text-amber-300 border-amber-600'}`}>
                      {vSharkscopeVerified ? '✓ Đã Kết Nối' : 'Chờ Kết Nối'}
                    </span>
                  </div>

                  <div className="space-y-2 text-xs">
                    <div>
                      <label className="text-[11px] text-[#a68a56] block mb-0.5">Nickname bàn cược Online:</label>
                      <input
                        type="text"
                        value={vOnlineNick}
                        onChange={(e) => setVOnlineNick(e.target.value)}
                        placeholder="Ví dụ: Tidu_NL500, Shark_VN..."
                        className="w-full bg-[#140c06] border border-[#382312] rounded-lg px-2.5 py-1.5 text-xs text-[#fce8ba] focus:outline-none focus:border-sky-400"
                      />
                    </div>

                    <div>
                      <label className="text-[11px] text-[#a68a56] block mb-0.5">Mạng / Phòng chơi chính:</label>
                      <input
                        type="text"
                        value={vOnlineNet}
                        onChange={(e) => setVOnlineNet(e.target.value)}
                        placeholder="GGNetwork (GGPoker), PokerStars, WPN, 888poker..."
                        className="w-full bg-[#140c06] border border-[#382312] rounded-lg px-2.5 py-1.5 text-xs text-[#fce8ba] focus:outline-none focus:border-sky-400"
                      />
                    </div>

                    <div>
                      <label className="text-[11px] text-[#a68a56] block mb-0.5">Link SharkScope / OPR / Thống kê ROI:</label>
                      <input
                        type="text"
                        value={vSharkscopeUrl}
                        onChange={(e) => setVSharkscopeUrl(e.target.value)}
                        placeholder="https://sharkscope.com/#Player-Statistics//networks/..."
                        className="w-full bg-[#140c06] border border-[#382312] rounded-lg px-2.5 py-1.5 text-xs text-[#fce8ba] focus:outline-none focus:border-sky-400"
                      />
                    </div>

                    <div>
                      <label className="text-[11px] text-[#a68a56] block mb-0.5">Lợi nhuận khai báo / ROI% & Số giải:</label>
                      <input
                        type="text"
                        value={vSharkscopeProfit}
                        onChange={(e) => setVSharkscopeProfit(e.target.value)}
                        placeholder="Ví dụ: +$42,850 (ROI 19.4%, Count: 2,500 games)"
                        className="w-full bg-[#140c06] border border-[#382312] rounded-lg px-2.5 py-1.5 text-xs text-[#fce8ba] focus:outline-none focus:border-sky-400"
                      />
                    </div>

                    <div className="pt-2 flex items-center justify-between gap-2 flex-wrap">
                      <div className="flex items-center gap-1.5">
                        <a
                          href="https://www.sharkscope.com/"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-2 py-1 rounded bg-[#102033] hover:bg-[#1a3352] text-sky-300 text-[10px] font-bold border border-sky-800 flex items-center gap-1 cursor-pointer"
                        >
                          <span>SharkScope</span>
                          <ExternalLink className="w-2.5 h-2.5" />
                        </a>
                        <a
                          href="https://officialpokerrankings.com/"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-2 py-1 rounded bg-[#102033] hover:bg-[#1a3352] text-sky-300 text-[10px] font-bold border border-sky-800 flex items-center gap-1 cursor-pointer"
                        >
                          <span>OPR</span>
                          <ExternalLink className="w-2.5 h-2.5" />
                        </a>
                        <a
                          href="https://pokerprolabs.com/"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-2 py-1 rounded bg-[#102033] hover:bg-[#1a3352] text-sky-300 text-[10px] font-bold border border-sky-800 flex items-center gap-1 cursor-pointer"
                        >
                          <span>PokerProLabs</span>
                          <ExternalLink className="w-2.5 h-2.5" />
                        </a>
                      </div>

                      <label className="flex items-center gap-1 text-[11px] text-sky-200 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={vSharkscopeVerified}
                          onChange={(e) => setVSharkscopeVerified(e.target.checked)}
                          className="rounded text-sky-600 focus:ring-0 cursor-pointer"
                        />
                        <span>Đã xác minh</span>
                      </label>
                    </div>
                  </div>
                </div>

                {/* CỔNG 2: TRA CỨU TÊN TUỔI GIẢI LIVE */}
                <div className="p-4 rounded-xl bg-[#0d0703] border-2 border-amber-800/60 space-y-3 shadow-lg">
                  <div className="flex items-center justify-between border-b border-amber-950 pb-2">
                    <div className="flex items-center space-x-2">
                      <div className="w-7 h-7 rounded-lg bg-amber-950 text-amber-400 border border-amber-700 flex items-center justify-center font-bold">
                        <Trophy className="w-4 h-4" />
                      </div>
                      <span className="font-black text-xs text-amber-200 uppercase">
                        (2) Tên thật & Link Hendon Mob/GPI cho Live Tour
                      </span>
                    </div>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${vLiveVerified ? 'bg-emerald-950 text-emerald-300 border-emerald-600' : 'bg-amber-950 text-amber-300 border-amber-600'}`}>
                      {vLiveVerified ? '✓ Đã Xác Thực' : 'Chờ Thẩm Định'}
                    </span>
                  </div>

                  <div className="space-y-2 text-xs">
                    <div>
                      <label className="text-[11px] text-[#a68a56] block mb-0.5">Họ tên thi đấu Giải Live:</label>
                      <input
                        type="text"
                        value={vLiveName}
                        onChange={(e) => setVLiveName(e.target.value)}
                        placeholder="Ví dụ: Nguyen Van Tidu, Tran Hoang..."
                        className="w-full bg-[#140c06] border border-[#382312] rounded-lg px-2.5 py-1.5 text-xs text-[#fce8ba] focus:outline-none focus:border-amber-400"
                      />
                    </div>

                    <div>
                      <label className="text-[11px] text-[#a68a56] block mb-0.5">Đường dẫn The Hendon Mob profile:</label>
                      <input
                        type="text"
                        value={vHendonUrl}
                        onChange={(e) => setVHendonUrl(e.target.value)}
                        placeholder="https://pokerdb.thehendonmob.com/player.php?a=r&n=..."
                        className="w-full bg-[#140c06] border border-[#382312] rounded-lg px-2.5 py-1.5 text-xs text-[#fce8ba] focus:outline-none focus:border-amber-400"
                      />
                    </div>

                    <div>
                      <label className="text-[11px] text-[#a68a56] block mb-0.5">Điểm / Xếp hạng Global Poker Index (GPI):</label>
                      <input
                        type="text"
                        value={vGpiRank}
                        onChange={(e) => setVGpiRank(e.target.value)}
                        placeholder="Ví dụ: GPI #4,210 • Điểm: 1,840 pts • 2 Cúp Vô Địch"
                        className="w-full bg-[#140c06] border border-[#382312] rounded-lg px-2.5 py-1.5 text-xs text-[#fce8ba] focus:outline-none focus:border-amber-400"
                      />
                    </div>

                    <div className="pt-2 flex items-center justify-between gap-2 flex-wrap">
                      <div className="flex items-center gap-1.5">
                        <a
                          href="https://pokerdb.thehendonmob.com/"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-2 py-1 rounded bg-[#291a0c] hover:bg-[#3d2612] text-amber-300 text-[10px] font-bold border border-amber-800 flex items-center gap-1 cursor-pointer"
                        >
                          <span>The Hendon Mob</span>
                          <ExternalLink className="w-2.5 h-2.5" />
                        </a>
                        <a
                          href="https://www.globalpokerindex.com/"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-2 py-1 rounded bg-[#291a0c] hover:bg-[#3d2612] text-amber-300 text-[10px] font-bold border border-amber-800 flex items-center gap-1 cursor-pointer"
                        >
                          <span>GPI Index</span>
                          <ExternalLink className="w-2.5 h-2.5" />
                        </a>
                      </div>

                      <label className="flex items-center gap-1 text-[11px] text-amber-200 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={vLiveVerified}
                          onChange={(e) => setVLiveVerified(e.target.checked)}
                          className="rounded text-amber-600 focus:ring-0 cursor-pointer"
                        />
                        <span>Đã xác minh</span>
                      </label>
                    </div>
                  </div>
                </div>

                {/* CỔNG 3: BÀN ĐÁNH TIỀN MẶT (CASH GAME - 3 KÊNH QUỐC TẾ) */}
                <div className="p-4 rounded-xl bg-[#0d0703] border-2 border-purple-800/60 space-y-3 shadow-lg">
                  <div className="flex items-center justify-between border-b border-purple-950 pb-2">
                    <div className="flex items-center space-x-2">
                      <div className="w-7 h-7 rounded-lg bg-purple-950 text-purple-400 border border-purple-700 flex items-center justify-center font-bold">
                        <TrendingUp className="w-4 h-4" />
                      </div>
                      <div>
                        <span className="font-black text-xs text-purple-200 uppercase block">
                          (3) Nickname Statname/SmartHand (Online Cash) hoặc Lịch Sử Poker Bankroll Tracker (Live Cash)
                        </span>
                        <span className="text-[10px] text-purple-300/80">
                          Online Cash (Statname, SmartHand) & Live Cash (Session Log / Hourly Rate)
                        </span>
                      </div>
                    </div>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${vCashVerified ? 'bg-emerald-950 text-emerald-300 border-emerald-600' : 'bg-amber-950 text-amber-300 border-amber-600'}`}>
                      {vCashVerified ? '✓ Đã Đối Soát' : 'Chờ Nhập Liệu'}
                    </span>
                  </div>

                  <div className="space-y-2 text-xs">
                    {/* Kênh 1: Online Cash */}
                    <div className="p-2 rounded-lg bg-[#140b17] border border-purple-900/40 space-y-2">
                      <span className="text-[10px] font-black text-purple-300 uppercase tracking-wider block">
                        • Kênh 1: Online Cash Game (Statname & SmartHand)
                      </span>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        <div>
                          <label className="text-[10px] text-[#a68a56] block mb-0.5">Link Statname (statname.net):</label>
                          <input
                            type="text"
                            value={vStatnameUrl}
                            onChange={(e) => setVStatnameUrl(e.target.value)}
                            placeholder="https://statname.net/player/..."
                            className="w-full bg-[#0d0703] border border-[#382312] rounded px-2 py-1 text-xs text-[#fce8ba] focus:outline-none focus:border-purple-400"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] text-[#a68a56] block mb-0.5">Link SmartHand (smarthand.pro):</label>
                          <input
                            type="text"
                            value={vSmartHandUrl}
                            onChange={(e) => setVSmartHandUrl(e.target.value)}
                            placeholder="https://smarthand.pro/player/..."
                            className="w-full bg-[#0d0703] border border-[#382312] rounded px-2 py-1 text-xs text-[#fce8ba] focus:outline-none focus:border-purple-400"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="text-[10px] text-[#a68a56] block mb-0.5">Chỉ số thực chiến (VPIP / PFR / 3-Bet & BB/100):</label>
                        <input
                          type="text"
                          value={vCashVpipPfr3Bet}
                          onChange={(e) => setVCashVpipPfr3Bet(e.target.value)}
                          placeholder="Ví dụ: VPIP 23.5% | PFR 19.2% | 3-Bet 8.8% | Winrate +6.8 bb/100"
                          className="w-full bg-[#0d0703] border border-[#382312] rounded px-2 py-1 text-xs text-[#fce8ba] focus:outline-none focus:border-purple-400"
                        />
                      </div>
                      <div className="flex items-center gap-1.5 pt-0.5">
                        <a
                          href="https://statname.net/"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-2 py-0.5 rounded bg-[#200e2b] hover:bg-[#331745] text-purple-300 text-[10px] font-bold border border-purple-700 flex items-center gap-1 cursor-pointer"
                        >
                          <span>Statname.net</span>
                          <ExternalLink className="w-2.5 h-2.5" />
                        </a>
                        <a
                          href="https://smarthand.pro/"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-2 py-0.5 rounded bg-[#200e2b] hover:bg-[#331745] text-purple-300 text-[10px] font-bold border border-purple-700 flex items-center gap-1 cursor-pointer"
                        >
                          <span>SmartHand.pro</span>
                          <ExternalLink className="w-2.5 h-2.5" />
                        </a>
                      </div>
                    </div>

                    {/* Kênh 3: Live Cash Game */}
                    <div className="p-2 rounded-lg bg-[#140b17] border border-purple-900/40 space-y-2">
                      <span className="text-[10px] font-black text-purple-300 uppercase tracking-wider block">
                        • Kênh 3: Live Cash Game (Quản Lý Vốn & Xác Nhận CLB)
                      </span>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        <div>
                          <label className="text-[10px] text-[#a68a56] block mb-0.5">App ghi chép Bankroll:</label>
                          <select
                            value={vBankrollTrackerApp}
                            onChange={(e) => setVBankrollTrackerApp(e.target.value)}
                            className="w-full bg-[#0d0703] border border-[#382312] rounded px-2 py-1 text-xs text-[#fce8ba] focus:outline-none focus:border-purple-400"
                          >
                            <option value="Poker Bankroll Tracker">Poker Bankroll Tracker</option>
                            <option value="PokerRoll">PokerRoll App</option>
                            <option value="Poker Analytics">Poker Analytics</option>
                          </select>
                        </div>
                        <div>
                          <label className="text-[10px] text-[#a68a56] block mb-0.5">Stakes & Hourly Rate ($/giờ hoặc bb/100):</label>
                          <input
                            type="text"
                            value={vCashStake}
                            onChange={(e) => setVCashStake(e.target.value)}
                            placeholder="Live $2/$5 • Winrate: +$48/giờ (+8bb/giờ)"
                            className="w-full bg-[#0d0703] border border-[#382312] rounded px-2 py-1 text-xs text-[#fce8ba] focus:outline-none focus:border-purple-400"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="text-[10px] text-[#a68a56] block mb-0.5">Link Session Log / Báo cáo giờ chơi:</label>
                        <input
                          type="text"
                          value={vCashLog}
                          onChange={(e) => setVCashLog(e.target.value)}
                          placeholder="Link chia sẻ file nhật ký phiên chơi hoặc ảnh xuất từ app..."
                          className="w-full bg-[#0d0703] border border-[#382312] rounded px-2 py-1 text-xs text-[#fce8ba] focus:outline-none focus:border-purple-400"
                        />
                      </div>

                      <label className="flex items-center gap-1.5 text-[11px] text-amber-300 cursor-pointer pt-1 bg-[#1c0f24] p-1.5 rounded border border-amber-600/40">
                        <input
                          type="checkbox"
                          checked={vLiveCashCoachConfirmed}
                          onChange={(e) => setVLiveCashCoachConfirmed(e.target.checked)}
                          className="rounded text-amber-500 focus:ring-0 cursor-pointer"
                        />
                        <span className="font-semibold">
                          ✓ Xác nhận thực chiến từ Ban Giảng Viên CLB (đã ngồi cùng bàn / kiểm tra kỹ năng tại CLB)
                        </span>
                      </label>
                    </div>

                    <div className="pt-1 flex items-center justify-between text-[11px] text-[#8c6b45]">
                      <a
                        href="https://pokerbankrolltracker.net/"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-2 py-1 rounded bg-[#251233] hover:bg-[#381c4d] text-purple-300 text-[10px] font-bold border border-purple-800 flex items-center gap-1 cursor-pointer"
                      >
                        <span>Poker Bankroll Tracker</span>
                        <ExternalLink className="w-2.5 h-2.5" />
                      </a>

                      <label className="flex items-center gap-1 text-purple-200 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={vCashVerified}
                          onChange={(e) => setVCashVerified(e.target.checked)}
                          className="rounded text-purple-600 focus:ring-0 cursor-pointer"
                        />
                        <span>Đã đối soát Cash Game</span>
                      </label>
                    </div>
                  </div>
                </div>

                {/* CỔNG 4: TỰ CHỨNG MINH QUA TRACKER CÁ NHÂN (PT4 / HM3 / HAND2NOTE) */}
                <div className="p-4 rounded-xl bg-[#0d0703] border-2 border-emerald-800/60 space-y-3 shadow-lg">
                  <div className="flex items-center justify-between border-b border-emerald-950 pb-2">
                    <div className="flex items-center space-x-2">
                      <div className="w-7 h-7 rounded-lg bg-emerald-950 text-emerald-400 border border-emerald-700 flex items-center justify-center font-bold">
                        <Database className="w-4 h-4" />
                      </div>
                      <div>
                        <span className="font-black text-xs text-emerald-200 uppercase block">
                          (4) Nút Tải Lên Ảnh Graph + Thông Số Database từ PT4 / HM3 / Hand2Note
                        </span>
                        <span className="text-[10px] text-emerald-300/80">
                          Chờ xét duyệt lên Sao • Tối thiểu 50.000 - 100.000 hands & Đường All-in Adjusted EV
                        </span>
                      </div>
                    </div>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${vDatabaseVerified ? 'bg-emerald-950 text-emerald-300 border-emerald-600' : 'bg-amber-950 text-amber-300 border-amber-600'}`}>
                      {vDatabaseVerified ? '✓ Đã Kiểm Định' : 'Chờ Gửi File & Duyệt'}
                    </span>
                  </div>

                  <div className="space-y-2 text-xs">
                    <div>
                      <label className="text-[11px] text-[#a68a56] block mb-0.5">Phần mềm Tracker sử dụng:</label>
                      <select
                        value={vTrackerType}
                        onChange={(e) => setVTrackerType(e.target.value as any)}
                        className="w-full bg-[#140c06] border border-[#382312] rounded-lg px-2.5 py-1.5 text-xs text-[#fce8ba] focus:outline-none focus:border-emerald-400"
                      >
                        <option value="PT4">PokerTracker 4 (PT4 - .backup / .csv / .pt4)</option>
                        <option value="HM3">Hold'em Manager 3 (HM3 - Archive)</option>
                        <option value="Hand2Note">Hand2Note (H2N - Database export / Report)</option>
                      </select>
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-0.5">
                        <label className="text-[11px] text-[#a68a56]">Thông số Database - Tổng số Hand đã chơi:</label>
                        <span className="text-[10px] text-amber-400 font-bold">*Tối thiểu 50.000 - 100.000 hands</span>
                      </div>
                      <input
                        type="text"
                        value={vSampleHands}
                        onChange={(e) => setVSampleHands(e.target.value)}
                        placeholder="Ví dụ: 85,000 Hands NL100 Zoom (đạt chuẩn hội tụ) • Winrate: +6.8 bb/100"
                        className="w-full bg-[#140c06] border border-[#382312] rounded-lg px-2.5 py-1.5 text-xs text-[#fce8ba] focus:outline-none focus:border-emerald-400"
                      />
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-0.5">
                        <label className="text-[11px] text-[#a68a56]">Đường dẫn / Tên ảnh Graph (All-in Adjusted EV):</label>
                        <span className="text-[10px] text-emerald-400 font-bold">Bắt buộc có đường EV</span>
                      </div>
                      <input
                        type="text"
                        value={vAllInEvGraphUrl}
                        onChange={(e) => setVAllInEvGraphUrl(e.target.value)}
                        placeholder="Dán link ảnh Graph hoặc tên file ảnh có đường All-in Adjusted EV..."
                        className="w-full bg-[#140c06] border border-[#382312] rounded-lg px-2.5 py-1.5 text-xs text-[#fce8ba] focus:outline-none focus:border-emerald-400"
                      />
                    </div>

                    <div>
                      <label className="text-[11px] text-[#a68a56] block mb-0.5">Tải lên file Database / Ảnh Graph chờ duyệt Sao:</label>
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          value={vDatabaseFile}
                          onChange={(e) => setVDatabaseFile(e.target.value)}
                          placeholder="Chọn file hoặc dán link Google Drive/DropBox..."
                          className="flex-1 bg-[#140c06] border border-[#382312] rounded-lg px-2.5 py-1.5 text-xs text-[#fce8ba] focus:outline-none focus:border-emerald-400"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            setVDatabaseFile(`${vTrackerType}_Sample_85kHands_${Date.now().toString().slice(-4)}.zip`);
                            setVAllInEvGraphUrl(`${vTrackerType}_Graph_AllIn_EV_Verified.png`);
                            setVDatabaseVerified(true);
                          }}
                          className="px-2.5 py-1.5 rounded-lg bg-emerald-700 hover:bg-emerald-600 text-white text-[11px] font-bold flex items-center gap-1 cursor-pointer shrink-0 shadow"
                        >
                          <Upload className="w-3.5 h-3.5" />
                          <span>Tải Lên Ảnh Graph & Database</span>
                        </button>
                      </div>
                    </div>

                    <div className="pt-2 flex items-center justify-between text-[11px] text-[#8c6b45]">
                      <span>Tiêu chuẩn duyệt Sao: All-in EV, BB/100, 50k+ hands</span>
                      <label className="flex items-center gap-1 text-emerald-200 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={vDatabaseVerified}
                          onChange={(e) => setVDatabaseVerified(e.target.checked)}
                          className="rounded text-emerald-600 focus:ring-0 cursor-pointer"
                        />
                        <span>Đã thẩm định chờ duyệt Sao</span>
                      </label>
                    </div>
                  </div>
                </div>
              </div>

              {/* KHUNG CẤU HÌNH TIÊU CHUẨN XÉT DUYỆT SAO (DÀNH CHO ADMIN CẬP NHẬT) */}
              <div className="p-3.5 rounded-xl bg-[#090503] border border-[#3d2712] space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[#ffd875] flex items-center gap-1.5">
                    <Scale className="w-3.5 h-3.5 text-amber-400" />
                    Khung Cấu Hình Tiêu Chuẩn Nâng Sao (Admin Config Preview)
                  </span>
                  <span className="text-[10px] text-amber-400/80 bg-[#1f1208] px-2 py-0.5 rounded border border-amber-700/50">
                    Dành cho Ban Quản Trị thẩm định
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-1.5 text-center text-[10px]">
                  <div className="p-1.5 rounded bg-[#120a05] border border-[#382312]">
                    <div className="font-bold text-zinc-400">0 Sao (☆)</div>
                    <div className="text-[9px] text-[#735a38]">Chưa xác thực</div>
                  </div>
                  <div className="p-1.5 rounded bg-[#120a05] border border-[#382312]">
                    <div className="font-bold text-amber-400">1 Sao (★)</div>
                    <div className="text-[9px] text-[#735a38]">Liên kết 1 cổng</div>
                  </div>
                  <div className="p-1.5 rounded bg-[#120a05] border border-[#382312]">
                    <div className="font-bold text-amber-400">2 Sao (★★)</div>
                    <div className="text-[9px] text-[#735a38]">500 tour / 50k hands</div>
                  </div>
                  <div className="p-1.5 rounded bg-[#120a05] border border-[#382312]">
                    <div className="font-bold text-amber-400">3 Sao (★★★)</div>
                    <div className="text-[9px] text-[#735a38]">Mid Stakes & ROI dương</div>
                  </div>
                  <div className="p-1.5 rounded bg-[#120a05] border border-[#382312]">
                    <div className="font-bold text-amber-300">4 Sao (★★★★)</div>
                    <div className="text-[9px] text-[#735a38]">Final Table / $10k+</div>
                  </div>
                  <div className="p-1.5 rounded bg-[#120a05] border border-[#382312]">
                    <div className="font-bold text-amber-300">5 Sao (★★★★★)</div>
                    <div className="text-[9px] text-[#735a38]">Chuyên nghiệp (Pro)</div>
                  </div>
                  <div className="p-1.5 rounded bg-[#120a05] border border-[#382312]">
                    <div className="font-bold text-amber-200">6 Sao (★★★★★★)</div>
                    <div className="text-[9px] text-[#735a38]">Đẳng cấp quốc tế (Elite)</div>
                  </div>
                </div>
              </div>

              {/* Nút Hành Động */}
              <div className="flex items-center justify-end gap-3 pt-2 border-t border-[#382312]">
                <button
                  type="button"
                  onClick={() => setShowProfileModal(false)}
                  className="px-4 py-2 rounded-xl bg-[#24150a] hover:bg-[#38210f] text-[#d1ba88] text-xs font-bold transition-colors cursor-pointer"
                >
                  Đóng
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-[#ffd875] to-[#8b6b23] hover:from-[#ffe299] hover:to-[#a6822e] text-slate-950 text-xs font-black transition-all cursor-pointer shadow-lg flex items-center gap-1.5"
                >
                  <CheckCircle2 className="w-4 h-4 text-black" />
                  <span>Lưu Hồ Sơ & Xét Duyệt Sao</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================
          MODAL MỞ KHÓA DỊCH NGÔN NGỮ KHÁC (GIỌNG VĂN TRÂN TRỌNG & CHIỀU LÒNG NGƯỜI DÙNG)
      ======================================================== */}
      {showLangModal && pendingLang && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#170e07] border-2 border-[#b8933b] rounded-2xl max-w-lg w-full overflow-hidden shadow-2xl animate-fade-in">
            {/* Header Modal */}
            <div className="p-4 bg-gradient-to-r from-[#2c190a] via-[#3d230e] to-[#2c190a] border-b border-[#54361b] flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-amber-500/20 border border-amber-400/50 flex items-center justify-center text-amber-300">
                  <Globe2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm sm:text-base font-black text-[#ffd875] uppercase tracking-wide">
                    Trợ Lý Chuyển Ngữ Dành Cho Quý Cao Thủ
                  </h3>
                  <p className="text-[11px] text-[#d1ba88]">
                    Ngôn ngữ bản địa ({SUPPORTED_LANGUAGES.find((l) => l.code === nativeLang)?.flag}{' '}
                    {SUPPORTED_LANGUAGES.find((l) => l.code === nativeLang)?.label}) luôn phục vụ Quý khách hoàn toàn miễn phí
                  </p>
                </div>
              </div>
              <button
                onClick={handleCancelAdAndTranslation}
                title="Tạm dừng & Hủy chuyển ngữ"
                className="p-1.5 rounded-lg bg-[#241409] hover:bg-rose-950 text-[#d1ba88] hover:text-rose-300 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 space-y-4 text-xs text-[#e6cb9c] max-h-[85vh] overflow-y-auto">
              {/* Thông tin chế độ dịch đang chọn */}
              <div className="p-3 rounded-xl bg-[#110904] border border-[#3d2712] flex items-center justify-between">
                <div>
                  <div className="text-[11px] text-[#9e8052]">
                    {langModalMode === 'comments-native'
                      ? 'Mở khóa bản dịch các bình luận khác sang ngôn ngữ bản địa:'
                      : 'Ngôn ngữ Quý Cao thủ đang chọn trải nghiệm:'}
                  </div>
                  <div className="text-base font-black text-[#ffd875] mt-0.5 flex items-center gap-2">
                    <span>{SUPPORTED_LANGUAGES.find((l) => l.code === pendingLang)?.flag}</span>
                    <span>{SUPPORTED_LANGUAGES.find((l) => l.code === pendingLang)?.label}</span>
                  </div>
                </div>
                <span className="px-2.5 py-1 rounded-full bg-amber-950/90 border border-amber-600/60 text-amber-300 font-bold text-[11px]">
                  {langModalMode === 'comments-native' ? '💬 Dịch toàn bộ bình luận' : '✨ Bản dịch chuyên sâu'}
                </span>
              </div>

              {/* Cách 1: Xem video tài trợ 1 phút (60 giây) để dịch 1 lần hoặc dùng AI 1 lần */}
              <div className="p-4 rounded-xl bg-gradient-to-br from-[#1d1209] to-[#120a04] border border-emerald-700/60 space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <span className="font-black text-emerald-400 text-xs sm:text-sm uppercase flex items-center gap-1.5">
                    <span>
                      🎁 Cách 1: Xem Giới Thiệu Tài Trợ 1 Phút (60 Giây) — Miễn Phí
                    </span>
                  </span>
                  <span className="px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-700 text-[10px] font-bold shrink-0">
                    1 Lần • 30 phút
                  </span>
                </div>

                {!adPlaying ? (
                  <>
                    <div className="p-3 rounded-lg bg-[#0d0703] border border-[#382312] text-[11px] text-[#d1ba88] space-y-1.5 leading-relaxed">
                      {langModalMode === 'comments-native' ? (
                        <>
                          <p>
                            ✨ Bài viết chính của tác giả và nguồn trích dẫn đã được hiển thị sẵn miễn phí. Để đọc trọn vẹn <strong>bản dịch tiếng bản địa ({SUPPORTED_LANGUAGES.find((l) => l.code === nativeLang)?.label}) hoặc mở khóa AI</strong> cho chủ đề này, CLB kính mời Quý Cao thủ đồng hành cùng nhà tài trợ nhé!
                          </p>
                          <p>
                            💝 Chỉ cần dành đúng <strong>1 phút (60 giây)</strong> xem video giới thiệu tài trợ, Quý khách sẽ mở khóa toàn bộ nội dung & AI của chủ đề này suốt <strong>30 phút</strong>!
                          </p>
                        </>
                      ) : (
                        <>
                          <p>
                            ✨ CLB rất hân hạnh được chuyển ngữ trọn vẹn chủ đề này sang{' '}
                            <strong className="text-[#ffd875]">
                              {SUPPORTED_LANGUAGES.find((l) => l.code === pendingLang)?.label}
                            </strong>{' '}
                            để phục vụ quá trình nghiên cứu chiến thuật của Quý Cao thủ!
                          </p>
                          <p>
                            💝 Chỉ cần dành <strong>{AD_DURATION_SECONDS} giây</strong> đồng hành cùng nhà tài trợ trong lúc hệ thống biên dịch, Quý khách sẽ sở hữu ngay bản dịch chuẩn xác cho chủ đề này suốt <strong>30 phút</strong>. Khi muốn thưởng thức thêm chủ đề khác, Quý khách chỉ cần ghé xem thêm một lượt tài trợ nữa để ủng hộ CLB nhé!
                          </p>
                        </>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setAdSecondsLeft(
                          langModalMode === 'comments-native' ? AD_COMMENTS_DURATION_SECONDS : AD_DURATION_SECONDS
                        );
                        setActiveYoutubeIdx(0); // Mặc định phát video chính https://youtu.be/L8AnuzAt6RM
                        setAdPlaying(true);
                        setTimeout(() => {
                          try {
                            ((window as any).adsbygoogle = (window as any).adsbygoogle || []).push({});
                          } catch {}
                        }, 150);
                      }}
                      className="w-full py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-black text-xs shadow-lg cursor-pointer transition-all flex items-center justify-center gap-2"
                    >
                      <span>▶ Xem quảng cáo ngay</span>
                    </button>
                  </>
                ) : (
                  <div className="p-3.5 rounded-xl bg-black/95 border-2 border-amber-500/70 space-y-3 text-center">
                    {/* Lời nhắn ngọt ngào, nịnh người dùng trong lúc dịch */}
                    <div className="p-3 rounded-lg bg-amber-950/60 border border-amber-500/60 text-amber-200 text-xs font-medium leading-relaxed text-left">
                      ✨ <strong className="text-[#ffd875]">Hệ thống đang tận tâm chuẩn bị bản dịch chất lượng nhất dành riêng cho Quý Cao thủ!</strong> Trong ít giây chờ đợi chuyển ngữ, kính mời Quý khách thưởng thức video từ kênh chính thức <strong className="text-amber-300">@choipoker</strong> để tiếp thêm động lực cho CLB. Xin Quý khách vui lòng đừng đóng màn hình này nhé, vì nếu thoát giữa chừng thì tiến trình dịch thuật cũng sẽ bị hủy theo và chưa thể phục vụ Quý khách ngay được ạ!
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-emerald-300 font-bold px-1">
                      <span>
                        ⏳{' '}
                        {langModalMode === 'comments-native'
                          ? 'Đang dịch toàn bộ các bình luận sang ngôn ngữ bản địa...'
                          : 'Đang biên dịch chủ đề phục vụ Quý khách...'}
                      </span>
                      <span className="px-2.5 py-0.5 rounded bg-emerald-900 text-white font-black">
                        Chỉ còn {adSecondsLeft}s
                      </span>
                    </div>

                    {/* KHUNG PHÁT VIDEO TRỰC TIẾP TỪ KÊNH YOUTUBE @CHOIPOKER CỦA CHỦ DIỄN ĐÀN */}
                    <div className="p-3 rounded-xl bg-gradient-to-b from-[#241407] to-[#120a04] border border-amber-500/50 text-amber-200 space-y-2.5">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div className="text-left">
                          <div className="text-[11px] font-black text-[#ffd875] flex items-center gap-1.5">
                            <span>📺 KÊNH YOUTUBE CHÍNH THỨC: @CHOIPOKER</span>
                          </div>
                          <div className="text-[11px] text-[#e6cb9c] line-clamp-1">
                            {CHOIPOKER_YOUTUBE_VIDEOS[activeYoutubeIdx]?.title}
                          </div>
                        </div>
                        <a
                          href="https://www.youtube.com/@choipoker?sub_confirmation=1"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-2.5 py-1 rounded-lg bg-red-600 hover:bg-red-500 text-white font-black text-[10px] shadow transition shrink-0"
                        >
                          🔔 Đăng ký kênh @choipoker
                        </a>
                      </div>

                      <div className="relative w-full aspect-video rounded-lg overflow-hidden border border-[#593818] bg-black shadow-inner">
                        <iframe
                          key={CHOIPOKER_YOUTUBE_VIDEOS[activeYoutubeIdx]?.id}
                          src={`https://www.youtube.com/embed/${CHOIPOKER_YOUTUBE_VIDEOS[activeYoutubeIdx]?.id}?autoplay=1&rel=0&playsinline=1`}
                          title={CHOIPOKER_YOUTUBE_VIDEOS[activeYoutubeIdx]?.title}
                          className="w-full h-full"
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                          allowFullScreen
                        />
                      </div>

                      {/* Chọn đổi nhanh giữa các video trên kênh @choipoker */}
                      <div className="flex items-center justify-between gap-1.5 pt-0.5 overflow-x-auto pb-1">
                        {CHOIPOKER_YOUTUBE_VIDEOS.map((vid, idx) => (
                          <button
                            key={vid.id}
                            type="button"
                            onClick={() => setActiveYoutubeIdx(idx)}
                            className={`px-2 py-1 rounded text-[10px] font-bold shrink-0 cursor-pointer transition ${
                              activeYoutubeIdx === idx
                                ? 'bg-[#ffd875] text-slate-950 shadow'
                                : 'bg-[#1a0f07] text-[#c7ab7c] border border-[#3d2712] hover:border-amber-500/60'
                            }`}
                          >
                            🎬 Video #{idx + 1}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="w-full bg-[#24150a] h-2.5 rounded-full overflow-hidden">
                      <div
                        className="bg-gradient-to-r from-emerald-400 to-amber-400 h-full transition-all duration-1000"
                        style={{
                          width: `${
                            (((langModalMode === 'comments-native' ? AD_COMMENTS_DURATION_SECONDS : AD_DURATION_SECONDS) -
                              adSecondsLeft) /
                              (langModalMode === 'comments-native' ? AD_COMMENTS_DURATION_SECONDS : AD_DURATION_SECONDS)) *
                            100
                          }%`
                        }}
                      />
                    </div>

                    <div className="flex items-center justify-between gap-2 pt-1">
                      <span className="text-[10px] text-[#9e8052] text-left">
                        Bản dịch sẽ sẵn sàng phục vụ Quý khách sau {adSecondsLeft} giây (Hiệu lực 30 phút cho chủ đề này)
                      </span>
                      <button
                        type="button"
                        onClick={handleCancelAdAndTranslation}
                        className="px-3 py-1 rounded-lg bg-rose-950/90 hover:bg-rose-900 border border-rose-600/60 text-rose-200 text-[11px] font-bold cursor-pointer shrink-0"
                      >
                        ✕ Tạm Dừng & Hủy Dịch
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Cách 2: Đăng ký gói Hội viên (1 Ngày / 1 Tháng / 1 Năm / 3 Năm) */}
              <div className="p-4 rounded-xl bg-gradient-to-br from-[#211308] to-[#130a04] border border-amber-600/60 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-black text-[#ffd875] text-xs sm:text-sm uppercase flex items-center gap-1.5">
                    <span>👑 Cách 2: Hội Viên Diễn Đàn (Từ 5k Cốc Trà Đá / Tháng / Năm / 3 Năm)</span>
                  </span>
                  <span className="px-2 py-0.5 rounded bg-amber-950 text-amber-300 border border-amber-600 text-[10px] font-bold">
                    Đọc & Dùng AI Không Giới Hạn
                  </span>
                </div>

                <p className="text-[11px] text-[#d1ba88] leading-relaxed">
                  Nếu Quý Cao thủ muốn đọc thông suốt và hỏi đáp AI chiến thuật không giới hạn mà không cần chờ đợi video quảng cáo, CLB trân trọng gửi tới Quý khách các gói trải nghiệm linh hoạt từ 1 cốc trà đá:
                </p>

                {/* Chọn gói: 1 Ngày (5k), 1 Tháng (45k), 1 Năm (450k), 3 Năm (1.125k) */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {/* Gói Ngày - 5k */}
                  <div
                    onClick={() => setSelectedSubPlan('day')}
                    className={`p-2 rounded-xl border cursor-pointer transition-all flex flex-col justify-between ${
                      selectedSubPlan === 'day'
                        ? 'bg-[#2c190a] border-amber-400 shadow-md ring-1 ring-amber-400/40'
                        : 'bg-[#120a04] border-[#3d2712] opacity-80 hover:opacity-100'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-xs text-amber-300">1 Ngày</span>
                        <span className="text-[9px] px-1.5 py-0.2 rounded bg-amber-950 border border-amber-700/60 text-amber-300">
                          24 giờ
                        </span>
                      </div>
                      <div className="text-base font-black text-[#ffd875] mt-1">
                        {DAILY_PRICE_VND.toLocaleString('vi-VN')}đ
                      </div>
                      <div className="text-[10px] text-amber-200/80 mt-0.5">1 Cốc trà đá ☕</div>
                    </div>
                    <div className="text-[9px] text-amber-400/80 font-mono mt-1 pt-1 border-t border-[#26150a]">
                      Cú pháp: <span className="font-bold text-amber-300">forumD</span>
                    </div>
                  </div>

                  {/* Gói Tháng - 45k */}
                  <div
                    onClick={() => setSelectedSubPlan('month')}
                    className={`p-2 rounded-xl border cursor-pointer transition-all flex flex-col justify-between ${
                      selectedSubPlan === 'month'
                        ? 'bg-[#2c190a] border-[#ffd875] shadow-md ring-1 ring-[#ffd875]/40'
                        : 'bg-[#120a04] border-[#3d2712] opacity-80 hover:opacity-100'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-xs text-[#e6cb9c]">1 Tháng</span>
                        <span className="text-[9px] px-1.5 py-0.2 rounded bg-[#1d1107] text-[#b39562]">30 ngày</span>
                      </div>
                      <div className="text-base font-black text-[#ffd875] mt-1">
                        {MONTHLY_PRICE_VND.toLocaleString('vi-VN')}đ
                      </div>
                      <div className="text-[10px] text-[#8c6b45] mt-0.5">Trải nghiệm linh hoạt</div>
                    </div>
                    <div className="text-[9px] text-amber-400/80 font-mono mt-1 pt-1 border-t border-[#26150a]">
                      Cú pháp: <span className="font-bold text-amber-300">forumM</span>
                    </div>
                  </div>

                  {/* Gói 1 Năm - 450k */}
                  <div
                    onClick={() => setSelectedSubPlan('year')}
                    className={`p-2 rounded-xl border cursor-pointer transition-all relative flex flex-col justify-between ${
                      selectedSubPlan === 'year'
                        ? 'bg-[#2c190a] border-[#ffd875] shadow-md ring-1 ring-[#ffd875]/40'
                        : 'bg-[#120a04] border-[#3d2712] opacity-80 hover:opacity-100'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-xs text-amber-300">1 Năm</span>
                        <span className="text-[8px] px-1 py-0.2 rounded bg-amber-500 text-slate-950 font-black">
                          Tặng 2 Tháng
                        </span>
                      </div>
                      <div className="text-base font-black text-[#ffd875] mt-1">
                        {YEARLY_PRICE_VND.toLocaleString('vi-VN')}đ
                      </div>
                      <div className="text-[10px] text-emerald-400 font-semibold mt-0.5">
                        Tính 10 tháng (~37k/th)
                      </div>
                    </div>
                    <div className="text-[9px] text-amber-400/80 font-mono mt-1 pt-1 border-t border-[#26150a]">
                      Cú pháp: <span className="font-bold text-amber-300">Forum (M)</span>
                    </div>
                  </div>

                  {/* Gói 3 Năm - 1.125k (-17%) */}
                  <div
                    onClick={() => setSelectedSubPlan('3year')}
                    className={`p-2 rounded-xl border cursor-pointer transition-all relative flex flex-col justify-between ${
                      selectedSubPlan === '3year'
                        ? 'bg-[#2c190a] border-emerald-400 shadow-md ring-1 ring-emerald-400/40'
                        : 'bg-[#120a04] border-[#3d2712] opacity-80 hover:opacity-100'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-xs text-emerald-300">3 Năm</span>
                        <span className="text-[8px] px-1 py-0.2 rounded bg-emerald-500 text-slate-950 font-black">
                          🔥 -17%
                        </span>
                      </div>
                      <div className="text-base font-black text-emerald-400 mt-1">
                        {THREE_YEAR_PRICE_VND.toLocaleString('vi-VN')}đ
                      </div>
                      <div className="text-[10px] text-emerald-300 font-semibold mt-0.5">
                        1.095 ngày (Bớt 225k)
                      </div>
                    </div>
                    <div className="text-[9px] text-amber-400/80 font-mono mt-1 pt-1 border-t border-[#26150a]">
                      Cú pháp: <span className="font-bold text-amber-300">forum3Y</span>
                    </div>
                  </div>
                </div>

                {/* Khung Quét Mã VietQR Tự Động Mở Khóa 100% (MBBank VA: VQRQANAKX0402 - ForumP) */}
                <div className="p-3.5 rounded-xl bg-[#0d0703] border border-amber-500/50 flex flex-col sm:flex-row items-center gap-4">
                  <div className="bg-white p-2 rounded-xl shrink-0 shadow-lg border-2 border-[#ffd875] text-center">
                    <img
                      src={`https://img.vietqr.io/image/${VIETQR_BANK_ID}-${VIETQR_ACCOUNT_NO}-compact2.png?amount=${
                        selectedSubPlan === '3year'
                          ? THREE_YEAR_PRICE_VND
                          : selectedSubPlan === 'year'
                          ? YEARLY_PRICE_VND
                          : selectedSubPlan === 'month'
                          ? MONTHLY_PRICE_VND
                          : DAILY_PRICE_VND
                      }&addInfo=${encodeURIComponent(
                        selectedSubPlan === '3year'
                          ? `forum3Y ${qrOrderCode}`
                          : selectedSubPlan === 'year'
                          ? `Forum (M) ${qrOrderCode}`
                          : selectedSubPlan === 'month'
                          ? `forumM ${qrOrderCode}`
                          : `forumD ${qrOrderCode}`
                      )}&accountName=${encodeURIComponent(VIETQR_ACCOUNT_NAME)}`}
                      alt="Mã VietQR Tự Động Mở Khóa"
                      className="w-36 h-36 sm:w-40 sm:h-40 object-contain rounded"
                    />
                    <div className="text-[10px] font-black text-slate-800 mt-1 bg-amber-200/80 rounded py-0.5 px-1">
                      {selectedSubPlan === '3year' 
                        ? 'Gói 3 Năm (1.125k)' 
                        : selectedSubPlan === 'year' 
                        ? 'Gói 1 Năm (450k)' 
                        : selectedSubPlan === 'month' 
                        ? 'Gói 1 Tháng (45k)' 
                        : 'Gói 1 Ngày (5k - Trà đá)'}
                    </div>
                  </div>

                  <div className="flex-1 space-y-2 text-left w-full">
                    <div className="text-xs font-black text-[#ffd875] uppercase flex items-center justify-between gap-2">
                      <span>⚡ Quét VietQR — Tự Động Mở Khóa 24/7</span>
                      <span className="px-2 py-0.5 rounded bg-emerald-950 border border-emerald-600/60 text-emerald-300 text-[10px]">
                        Tự động 100%
                      </span>
                    </div>

                    {/* 4 Nút Chọn Nhanh Mã QR: 5k - 45k - 450k - 1125k */}
                    <div className="grid grid-cols-4 gap-1 p-1 bg-[#160c05] rounded-lg border border-[#382312]">
                      <button
                        type="button"
                        onClick={() => setSelectedSubPlan('day')}
                        className={`py-1.5 px-1 rounded text-center transition-all ${
                          selectedSubPlan === 'day'
                            ? 'bg-gradient-to-r from-amber-400 to-amber-600 text-slate-950 font-black shadow'
                            : 'text-[#d1ba88] hover:text-[#ffd875] bg-[#221308]'
                        }`}
                      >
                        <div className="text-[9px] font-semibold">1 Ngày ☕</div>
                        <div className="text-[11px] font-black">5.000đ</div>
                      </button>
                      <button
                        type="button"
                        onClick={() => setSelectedSubPlan('month')}
                        className={`py-1.5 px-1 rounded text-center transition-all ${
                          selectedSubPlan === 'month'
                            ? 'bg-gradient-to-r from-[#ffd875] to-[#c79832] text-slate-950 font-black shadow'
                            : 'text-[#d1ba88] hover:text-[#ffd875] bg-[#221308]'
                        }`}
                      >
                        <div className="text-[9px] font-semibold">1 Tháng</div>
                        <div className="text-[11px] font-black">45.000đ</div>
                      </button>
                      <button
                        type="button"
                        onClick={() => setSelectedSubPlan('year')}
                        className={`py-1.5 px-1 rounded text-center transition-all ${
                          selectedSubPlan === 'year'
                            ? 'bg-gradient-to-r from-[#ffd875] to-[#c79832] text-slate-950 font-black shadow'
                            : 'text-[#d1ba88] hover:text-[#ffd875] bg-[#221308]'
                        }`}
                      >
                        <div className="text-[9px] font-semibold">1 Năm</div>
                        <div className="text-[11px] font-black">450.000đ</div>
                      </button>
                      <button
                        type="button"
                        onClick={() => setSelectedSubPlan('3year')}
                        className={`py-1.5 px-1 rounded text-center transition-all ${
                          selectedSubPlan === '3year'
                            ? 'bg-gradient-to-r from-emerald-400 to-emerald-600 text-slate-950 font-black shadow'
                            : 'text-emerald-400 hover:text-emerald-300 bg-[#162215]'
                        }`}
                      >
                        <div className="text-[9px] font-semibold">3 Năm 🔥</div>
                        <div className="text-[11px] font-black">1.125k</div>
                      </button>
                    </div>

                    <div className="p-2.5 rounded-lg bg-[#160c05] border border-[#382312] space-y-1 text-[11px]">
                      <div className="flex justify-between gap-2">
                        <span className="text-[#9e8052]">Ngân hàng:</span>
                        <span className="font-bold text-[#f5dfb0]">{VIETQR_BANK_NAME}</span>
                      </div>
                      <div className="flex justify-between gap-2">
                        <span className="text-[#9e8052]">Tài khoản ảo (VA):</span>
                        <span className="font-black text-[#ffd875] tracking-wider">{VIETQR_ACCOUNT_NO}</span>
                      </div>
                      <div className="flex justify-between gap-2">
                        <span className="text-[#9e8052]">Đơn vị thụ hưởng:</span>
                        <span className="font-bold text-amber-300">{VIETQR_ACCOUNT_NAME}</span>
                      </div>
                      <div className="flex justify-between gap-2">
                        <span className="text-[#9e8052]">Số tiền tự điền:</span>
                        <span className="font-black text-emerald-400">
                          {(selectedSubPlan === '3year'
                            ? THREE_YEAR_PRICE_VND
                            : selectedSubPlan === 'year'
                            ? YEARLY_PRICE_VND
                            : selectedSubPlan === 'month'
                            ? MONTHLY_PRICE_VND
                            : DAILY_PRICE_VND
                          ).toLocaleString('vi-VN')}đ
                        </span>
                      </div>
                      <div className="flex justify-between gap-2">
                        <span className="text-[#9e8052]">Nội dung CK:</span>
                        <span className="font-black text-amber-300 font-mono">
                          {selectedSubPlan === '3year'
                            ? `forum3Y ${qrOrderCode}`
                            : selectedSubPlan === 'year'
                            ? `Forum (M) ${qrOrderCode}`
                            : selectedSubPlan === 'month'
                            ? `forumM ${qrOrderCode}`
                            : `forumD ${qrOrderCode}`}
                        </span>
                      </div>
                    </div>

                    {!verifyingQrPayment ? (
                      <button
                        type="button"
                        onClick={handleStartAutoVerifyQr}
                        className="w-full py-2.5 px-3 rounded-xl bg-gradient-to-r from-[#ffd875] to-[#b88928] hover:from-[#ffe299] hover:to-[#cfa036] text-slate-950 font-black text-xs cursor-pointer shadow-lg transition-all flex items-center justify-center gap-1.5"
                      >
                        <span>✅ Tôi Đã Quét QR Chuyển Khoản — Mở Khóa Ngay</span>
                      </button>
                    ) : (
                      <div className="w-full py-2.5 px-3 rounded-xl bg-emerald-950/90 border border-emerald-500/70 text-emerald-200 font-bold text-xs text-center animate-pulse">
                        🔄 Hệ thống đang tự động xác nhận giao dịch & mở khóa cho Quý Cao thủ ({verifyQrCountdown}s)...
                      </div>
                    )}
                  </div>
                </div>

                <form onSubmit={handleActivateSubscription} className="flex flex-col sm:flex-row gap-2 pt-1">
                  <input
                    type="text"
                    value={subCodeInput}
                    onChange={(e) => setSubCodeInput(e.target.value)}
                    placeholder="Hoặc nhập mã Hội viên ưu đãi (nếu đã có sẵn mã)..."
                    className="flex-1 bg-[#0d0703] border border-[#4a3016] rounded-lg px-3 py-2 text-xs text-[#ffd875] placeholder-[#735a38] focus:outline-none focus:border-amber-400"
                  />
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-lg bg-[#29170a] hover:bg-[#3d2310] border border-[#784f1f] text-[#ffd875] font-bold text-xs cursor-pointer whitespace-nowrap"
                  >
                    Kích Hoạt Bằng Mã
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* FOOTER DIỄN ĐÀN CHUẨN */}
      <footer className="border-t border-[#3d2712] bg-[#120a05] py-4 px-4 text-center text-xs text-[#8c6b45] space-y-1 mt-6">
        <p>Diễn đàn Học Poker • Bản quyền thuộc về cộng đồng <strong>hocpoker.forumvi.com</strong></p>
        <p className="text-[11px] text-[#6b5235]">Tổng hợp chiến thuật từ TwoPlusTwo (2+2), CardsChat, PokerStrategy, CardPlayer, Run It Once, CrushLivePoker & r/Poker_Theory</p>
      </footer>
    </div>
  );
}
