import express from 'express';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }
  next();
});
app.use(express.json({ limit: '10mb' }));

const apiKey = process.env.GEMINI_API_KEY || '';
const ai = new GoogleGenAI({
  apiKey,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

const POKER_VIETNAMESE_PROMPT = `
Bạn là AI Trọng Tài Chuyên Môn Của CLB Chơi Poker (choipoker.vercel.app / hocpoker.forumvi.com).

QUY CHUẨN PHÁN QUYẾT BẮT BUỘC:
Khi thành viên đăng một tình huống khó lên diễn đàn và thảo luận, hãy đọc toàn bộ thông số bàn chơi (Vị trí, Stack, Ngoại cảnh, Bài tẩy, Mặt bài), tâm lý đối thủ và các bình luận của thành viên. Sau đó đưa ra PHÁN QUYẾT ĐỘC LẬP gồm đúng 3 mục sau:

[Mục 1: Đánh giá tính hợp lý của từng phương án mà thành viên nêu ra]
- Phân tích chi tiết từng hướng đi bài (Bỏ bài Fold, Theo cược Call, Tố cược Raise, Tố tất tay All-in, Cược tiếp nối C-bet...).
- Đánh giá khách quan các ý kiến/bình luận của thành viên dưới bài viết: Chỉ rõ ai nhận định sắc bén, ai phân tích chưa trúng.

[Mục 2: Chỉ rõ điểm mù hoặc lỗi tư duy nếu có]
- Vạch trần các lỗi tâm lý và sai lầm chiến thuật:
  + Hội chứng tiếc bài (Sunk Cost): Call cố vì đã lỡ bỏ nhiều chip vào hũ trước đó.
  + Đánh theo cảm tính: Đoán đối thủ bluff bằng linh cảm thay vì đọc dải bài (Range) và tỷ lệ cược (Pot odds/SPR).
  + Bỏ quên chỉ số SPR & Áp lực ICM: Không tính đường lùi ở Turn/River, hoặc xem nhẹ áp lực rớt đài ở vòng cận tiền Bubble.
  + Mất vị trí: Chơi bài yếu ngoài vị trí hoặc cố bluff người chơi lì lợm (Calling Station).

[Mục 3: Chốt phương án xử lý tối ưu nhất vừa đảm bảo an toàn vừa tối đa hóa lợi nhuận thực chiến]
- Đưa ra line hành động cụ thể từng bước (Action Plan) theo chuẩn tư duy CLB.
- Cân bằng giữa quản lý rủi ro (Risk Management) và tối đa hóa lợi nhuận kỳ vọng (+EV) để kiếm ăn ổn định lâu dài.
- Đúc kết bài học cốt lõi bằng 1 câu châm ngôn ngắn gọn.

YÊU CẦU NGÔN NGỮ:
Mọi phản hồi, phân tích, giải thích BẮT BUỘC 100% BẰNG TIẾNG VIỆT CHUẨN THUẬT NGỮ THỰC CHIẾN, TUYỆT ĐỐI KHÔNG DỊCH THÔ TỪNG CHỮ.
`;

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

export interface ForumThread {
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
  comments: Array<{
    id: string;
    author: string;
    authorBadge: string;
    authorRole: string;
    avatarBg: string;
    time: string;
    content: string;
    likes: number;
  }>;
}

const FORUM_THREADS: ForumThread[] = [
  {
    id: 'bai-viet-00',
    mainSection: 'giang-day-nghien-cuu',
    mainSectionName: '3. Lò Luyện Từ Gà Hóa Sói',
    category: 'nhap-mon',
    categoryName: 'Chưa biết gì - Vào cho biết',
    subForum: 'Luật chơi Poker',
    originalSource: 'Diễn đàn Học Poker (hocpoker.forumvi.com)',
    title: 'Luật chơi chung của Poker - Nhập môn Texas Hold\'em toàn tập',
    author: 'Tidu',
    authorRole: 'Giảng viên',
    authorPosts: 54,
    authorJoinDate: '24/04/2017',
    publishedAt: 'Chủ đề ghim (Sticky)',
    isSticky: true,
    gameType: 'Kiến thức nền tảng bắt buộc',
    stakes: 'Dành cho tất cả người mới bắt đầu',
    views: 15820,
    replies: 88,
    likes: 940,
    summary: 'Muốn chơi một trò chơi bất kỳ, bạn luôn phải hiểu rõ luật chơi như thế nào. Hướng dẫn toàn diện từ bộ bài 52 lá, vị trí Dealer/Button, tiền mù SB/BB, quy trình 4 vòng cược và thứ tự so bài mạnh yếu.',
    detailedAnalysis: `1. Khái niệm cơ bản & Bàn chơi Texas Hold'em:
- Texas Hold'em được chơi bằng bộ bài chuẩn 52 lá (Tú lơ khơ).
- Số lượng người chơi tại mỗi bàn thông thường từ 2 tới 9 người (có thể 10 người nhưng rất hiếm khi).
- Trong bất kỳ ván đấu nào, bạn chỉ phải đấu trí và so bài với những người ngồi cùng bàn với mình.

2. Vị trí Nút chia bài (Dealer / Button):
- Trước mỗi ván, một người chơi được xác định là Dealer (Nút chia bài, viết tắt là BTN / BU).
- Khi chơi trực tuyến, vị trí này tự động xoay chuyển theo chiều kim đồng hồ sau mỗi ván chơi.
- Người ngồi ngay sau Button là hai vị trí bắt buộc phải nộp tiền cược mù trước khi chia bài:
  + Vị trí Mù nhỏ (Small Blind - SB): nộp 1/2 mức cược tiêu chuẩn.
  + Vị trí Mù lớn (Big Blind - BB): nộp đủ 1 mức cược tiêu chuẩn.

3. Diễn biến 4 vòng cược trong một ván:
• Vòng 1 - Vòng chia 2 lá đầu (Preflop): Mỗi người được chia 2 lá bài tẩy bí mật. Người ngồi cạnh Mù lớn (UTG) hành động đầu tiên: Bỏ bài (Fold), Theo cược (Call) hoặc Tố cược (Raise).
• Vòng 2 - Vòng lật 3 lá chung (Flop): Lật ngửa 3 lá bài chung ở giữa bàn. Mọi người chơi kết hợp 3 lá này với 2 lá trên tay để tính toán sức mạnh bài.
• Vòng 3 - Vòng lật lá thứ 4 (Turn): Lật lá bài chung thứ 4. Vòng cược tiếp tục theo chiều kim đồng hồ.
• Vòng 4 - Vòng lật lá cuối cùng (River): Lá bài chung thứ 5 được lật. Đây là vòng cược quyết định cuối cùng trước khi so điểm.
• So bài (Showdown): Những người chơi chưa bỏ bài sẽ ngửa bài. Người kết hợp được bộ 5 lá bài mạnh nhất sẽ giành toàn bộ hũ tiền trên bàn.

4. Bảng thứ bậc độ mạnh của các bộ bài (Từ cao xuống thấp):
1. Thùng phá sảnh Hoàng gia (Royal Flush): 10, J, Q, K, A cùng chất
2. Thùng phá sảnh (Straight Flush): 5 lá liên tiếp cùng chất
3. Tứ quý (Four of a Kind): 4 lá cùng điểm số
4. Cù lũ (Full House): 1 bộ ba + 1 đôi
5. Thùng (Flush): 5 lá cùng chất bất kỳ
6. Sảnh (Straight): 5 lá liên tiếp khác chất
7. Xám cô (Three of a Kind): 3 lá cùng điểm số
8. Hai đôi (Two Pair): Có 2 đôi khác nhau
9. Một đôi (One Pair): Có 1 đôi
10. Mậu thầu (High Card): Không kết hợp được bộ bài nào, so lá lớn nhất`,
    gtoRecommendations: `• Lời khuyên vàng của Giảng viên Tidu:
- Kỷ luật chọn bài tẩy (Starting Hand Selection): Người mới tuyệt đối không nên ván nào cũng bấm theo cược để xem bài. Chỉ nên tham gia từ 15% - 20% các ván bài có lá bài tẩy đẹp (Đôi cao, Át lớn, bài liên tiếp cùng chất).
- Lợi thế vị trí (Position): Vị trí Nút chia bài (Button) là vị trí mạnh nhất trên bàn vì bạn được hành động sau cùng, nắm trọn thông tin của mọi đối thủ trước khi ra quyết định.
- Quản lý vốn: Chỉ chơi ở mức cược phù hợp, không bao giờ đem toàn bộ số tiền mình có vào một bàn chơi duy nhất.`,
    keyTakeaways: [
      'Hiểu rõ luật chơi và thứ tự so bài là bước đệm cốt tử trước khi học chiến thuật nâng cao.',
      'Vị trí ngồi quyết định phần lớn tỷ lệ chiến thắng của bạn trong dài hạn.',
      'Bỏ bài (Fold) đúng lúc là vũ khí phòng thủ lợi hại nhất của một tay chơi thông minh.'
    ],
    comments: [
      {
        id: 'bl-001',
        author: 'Xuantruong888',
        authorBadge: 'Biên tập viên',
        authorRole: 'Biên tập',
        avatarBg: 'bg-blue-600',
        time: 'Hôm qua',
        content: 'Bài viết nhập môn rất chi tiết và dễ hiểu cho anh em mới tham gia diễn đàn! Đề xuất ghim lên đầu chuyên mục.',
        likes: 48
      },
      {
        id: 'bl-002',
        author: 'HocVien_HaNoi',
        authorBadge: 'Học viên Mới',
        authorRole: 'Học viên',
        avatarBg: 'bg-emerald-600',
        time: '3 giờ trước',
        content: 'Cảm ơn Thầy Tidu! Nhờ bài viết này mà em hiểu rõ cách tính vị trí Button và vòng chia bài.',
        likes: 19
      }
    ]
  },
  {
    id: 'bai-viet-clb-00',
    mainSection: 'giang-day-nghien-cuu',
    mainSectionName: '3. Lò Luyện Từ Gà Hóa Sói',
    category: 'giao-trinh-clb',
    categoryName: 'Giáo Trình Đào Tạo CLB',
    subForum: 'Nhập môn & Nền tảng thực chiến',
    originalSource: 'Giáo trình CLB Học Poker (Tác giả: Tidu)',
    title: '[Giáo Trình CLB - Bài 1] Nền Tảng & Luật Chơi Texas Hold\'em',
    author: 'Tidu',
    authorRole: 'Giảng viên',
    authorPosts: 54,
    authorJoinDate: '24/04/2017',
    publishedAt: 'Chủ đề ghim (Sticky CLB)',
    isSticky: true,
    gameType: 'Kiến thức nền tảng thực chiến',
    stakes: 'Bài học số 1 trong Giáo trình nội bộ CLB',
    views: 14200,
    replies: 92,
    likes: 1050,
    pdfUrl: '/assets/forum/giao_trinh_poker_luat_choi_tidu.pdf',
    driveLink: 'https://drive.google.com/file/d/1VeMAjafzB9GqpBiXRYR2h_P7WYPqvds5/view?usp=drive_link',
    youtubeUrl: 'https://www.youtube.com/results?search_query=chơi+Poker+Tidu',
    youtubeTitle: 'Kênh YouTube Chơi Poker • Video Bài Giảng Lịch Sử & Nhập Môn',
    summary: 'Bài học mở đầu giáo trình CLB: Bản chất độc nhất của Poker nằm ở Quyền Tố, tư duy xác suất và kỷ luật tâm lý. Tổng hợp ngắn gọn quy trình 4 vòng cược và thứ bậc bài 52 lá.',
    detailedAnalysis: `★ TRIẾT LÝ MỞ ĐẦU TỪ GIẢNG VIÊN TIDU:
"...Thói quen nhớ lại và phân tích kỹ về các tình huống đã qua, chưa chắc giúp bạn trở thành cao thủ. Nhưng mọi cao thủ đều có thói quen nhớ lại rõ ràng và phân tích kỹ về những tình huống mà họ đã trải qua..."

1. Bản Chất Độc Nhất Của Poker:
Khác với mọi trò chơi bài thông thường dựa vào may rủi, điểm khác biệt duy nhất và cốt lõi nhất của Poker là QUYỀN TỐ CHO LÁ BÀI CỦA MÌNH:
- Bạn hoàn toàn có thể nắm giữ bài yếu nhưng vẫn giành chiến thắng nhờ kỹ năng ép đối thủ bỏ bài (Fold).
- Ngược lại, khi nắm giữ bài rất mạnh, mục tiêu là tối đa hóa lợi nhuận (Value Bet) bằng cách dụ đối thủ theo cược.
- Yếu tố may mắn chỉ chi phối ngắn hạn từng ván bài, còn trong dài hạn, tư duy toán học, kỷ luật tâm lý và khả năng đọc tình huống mới là yếu tố quyết định.

2. Quy Trình Vận Hành Bàn Chơi Texas Hold'em (NLHE):
- Bộ bài: Chuẩn 52 lá, mỗi người được chia 2 lá bài tẩy bí mật.
- Bàn đấu: 6 người (6-max) hoặc 9 người (Full-ring), so tài trực tiếp với các đối thủ trên bàn.
- Vị trí quan trọng nhất: Button (BTN - Nút chia bài) là vị trí có lợi thế hành động sau cùng ở các vòng cược.

3. Diễn Biến 4 Vòng Cược:
• Preflop: Chia 2 lá bài tẩy. Người ngồi sau Mù Lớn (Big Blind) hành động trước: Bỏ bài (Fold), Theo cược (Call) hoặc Tố (Raise).
• Flop: Lật 3 lá bài chung ở giữa bàn. Bắt đầu vòng cược thứ hai.
• Turn: Lật lá bài chung thứ 4. Vòng cược tiếp diễn.
• River: Lật lá bài chung thứ 5. Vòng cược cuối cùng đầy tính quyết định.
• Showdown: Lật bài so sánh. Người kết hợp được 5 lá bài mạnh nhất (từ 2 lá trên tay và 5 lá chung) sẽ ăn trọn hũ tiền (Pot).

4. Thứ Tự Độ Mạnh Các Bộ Bài:
Royal Flush (Thùng phá sảnh lớn) > Straight Flush (Thùng phá sảnh) > Four of a Kind (Tứ quý) > Full House (Cù lũ) > Flush (Thùng) > Straight (Sảnh) > Three of a Kind (Xám cô) > Two Pair (Hai đôi) > One Pair (Một đôi) > High Card (Mậu thầu).

★ LỜI KHUYÊN NỀN TẢNG CỦA GIẢNG VIÊN TIDU:
"Hãy xây dựng một nền móng thật vững chắc từ luật chơi, kỷ luật vị trí cho đến quản lý vốn, để bạn không bao giờ phải trả giá bằng những sai lầm ngớ ngẩn trong một ván bài lớn!"`,
    gtoRecommendations: `• 3 Bài học cốt lõi cho học viên mới:
1. Quyền Tố (Raise) là linh hồn của Poker: Ai làm chủ được quyền cược tố, người đó làm chủ cuộc chơi.
2. Poker là môn Thể thao Trí tuệ: Yếu tố may mắn chỉ quyết định trong ngắn hạn, trình độ toán học và tâm lý mới quyết định chiến thắng trong dài hạn.
3. Luôn tôn trọng kỷ luật: Kiên định xây móng kiến thức thật chắc chắn trước khi nâng mức cược.`,
    keyTakeaways: [
      'Quyền Tố (Raise) là cơ chế tạo nên ưu thế kỹ năng dài hạn trong Poker.',
      'Nắm vững vị trí Button và quy trình 4 vòng cược (Preflop, Flop, Turn, River).',
      'Xây dựng thói quen ghi nhớ và phân tích sâu sắc các tình huống ván bài đã trải qua.'
    ],
    quizChallenge: {
      level: 1,
      levelName: 'Gà Mới Nhập Đàn',
      levelIcon: '🐣',
      question: 'Bạn ngồi ở vị trí Mù nhỏ (Small Blind), các vị trí trước đều bỏ bài tới bạn. Bạn nên hiểu thế nào về vị trí của mình sau khi Flop được chia ra?',
      options: [
        'Vị trí Small Blind luôn có lợi thế vì được chia bài sớm nhất',
        'Small Blind là vị trí bất lợi nhất vì luôn phải hành động đầu tiên trong cả 3 vòng Flop, Turn, River',
        'Đã nộp tiền mù rồi nên ván nào cũng phải call để xem Flop cho đỡ phí',
        'Chỉ cần bài tẩy đẹp thì vị trí trên bàn cược không còn quan trọng'
      ],
      correctIndex: 1,
      explanation: 'Chính xác! Small Blind luôn phải hành động đầu tiên suốt cả 3 vòng sau Flop, hoàn toàn mù thông tin trước đối thủ. Người chơi có tư duy CLB luôn ý thức rõ bất lợi này để hạn chế chơi bài rác ở Blind.'
    },
    comments: [
      {
        id: 'bl-ls-01',
        author: 'NguyenVan_Poker',
        authorBadge: 'Học viên CLB',
        authorRole: 'Học viên',
        avatarBg: 'bg-emerald-600',
        time: 'Vừa xong',
        content: 'Đọc bài lịch sử của Thầy Tidu viết từ năm 2016 thấy quá tự hào về bộ môn này! Nhờ Thầy mà em hiểu rõ Poker là môn thể thao trí tuệ đỉnh cao chứ không phải trò đỏ đen may rủi.',
        likes: 52
      },
      {
        id: 'bl-ls-02',
        author: 'MinhTri_Saigon',
        authorBadge: 'Biên tập viên',
        authorRole: 'Biên tập',
        avatarBg: 'bg-blue-600',
        time: '1 giờ trước',
        content: 'Cuốn sách 2016 của Thầy Tidu là cuốn cẩm nang gối đầu giường của bao thế hệ học viên. Bản PDF đính kèm rất giá trị cho anh em lưu trữ!',
        likes: 39
      }
    ]
  },
  {
    id: 'bai-viet-clb-01',
    mainSection: 'giang-day-nghien-cuu',
    mainSectionName: '3. Lò Luyện Từ Gà Hóa Sói',
    category: 'giao-trinh-clb',
    categoryName: 'Giáo Trình Đào Tạo CLB',
    subForum: 'Giáo trình nội bộ & Video YouTube CLB',
    originalSource: 'Giáo trình đào tạo nội bộ CLB Học Poker (Đồng bộ Video Kênh YouTube Tidu)',
    title: '[Giáo Trình CLB - Bài 2] Lối chơi TAG (Tight - Aggressive): Chặt chẽ & Tấn công - Kim chỉ nam số 1 cho học viên',
    author: 'Tidu',
    authorRole: 'Giảng viên',
    authorPosts: 54,
    authorJoinDate: '24/04/2017',
    publishedAt: 'Chủ đề ghim (Sticky CLB)',
    isSticky: true,
    gameType: 'Giáo trình chiến thuật nền tảng CLB',
    stakes: 'Bắt buộc hoàn thành trước khi học tài liệu nâng cao',
    views: 12450,
    replies: 76,
    likes: 820,
    youtubeUrl: 'https://www.youtube.com/results?search_query=chơi+Poker+lối+chơi+TAG+Tidu',
    youtubeTitle: 'Kênh YouTube Chơi Poker • Video Bài Giảng Lối Chơi TAG Thực Chiến',
    summary: 'Giáo trình độc quyền nội bộ CLB giúp học viên hiểu cặn kẽ bản chất lối chơi TAG (Tight-Aggressive): Tại sao phải chặt chẽ trước Flop và tấn công chủ động sau Flop? Đây là nền tảng cốt tử để học viên dễ dàng theo dõi video trên kênh YouTube của CLB và đọc hiểu các tài liệu nâng cao của thế giới.',
    detailedAnalysis: `★ LỜI MỞ ĐẦU TỪ GIẢNG VIÊN TIDU:
"Chào toàn thể anh em học viên CLB! Trong các video thực chiến trên kênh YouTube của mình, các bạn thường thấy mình liên tục nhắc đến thuật ngữ 'Lối chơi TAG'. Giáo trình này được biên soạn ngắn gọn, súc tích để các bạn vừa xem video vừa đối chiếu, từ đó hiểu sâu tại sao một người chơi TAG luôn kiếm được lợi nhuận đều đặn và bền vững nhất."

1. Bản Chất Cốt Lõi Của Lối Chơi TAG:
TAG là viết tắt của hai từ tiếng Anh:
- TIGHT (Chặt chẽ, chọn lọc): Bạn không bao giờ bấm Call lung tung với mọi lá bài. Người chơi TAG chỉ chọn tham gia vào ván bài với khoảng 18% - 22% các lá bài tẩy khởi đầu mạnh nhất (Đôi cao, Át lớn, bài liên tiếp cùng chất). Bằng cách này, bạn luôn bước vào ván đấu với lợi thế bài mạnh hơn đại đa số đối thủ trên bàn (Range Advantage).
- AGGRESSIVE (Tấn công chủ động): Khi đã quyết định tham gia ván bài, hãy là người TỐ CƯỢC (Raise), tuyệt đối KHÔNG THEO CƯỢC THỤ ĐỘNG (Limp/Flat Call). Người chơi tấn công có 2 cách để thắng tiền: (1) Ngửa bài có bài mạnh nhất, và (2) Khiến đối thủ phải Bỏ bài (Fold) trước cú cược của mình. Trong khi người chơi thụ động chỉ có duy nhất 1 cách là mong đợi may mắn có bài to ở Showdown!

2. Tại Sao Người Mới Bắt Buộc Phải Chơi TAG Trước Tiên?
- Giảm thiểu sai lầm đắt giá: Khi chỉ chơi bài tẩy mạnh và có vị trí (Position), các quyết định ở vòng Flop, Turn, River trở nên vô cùng rõ ràng và đơn giản, không bị đối phương dồn ép vào thế bài khó.
- Tối đa hóa giá trị tiền thưởng (Value Betting): Khi bạn có bài lớn, đối thủ chơi lỏng lẻo sẽ sẵn sàng trả tiền để xem bài của bạn.
- Cướp hũ tiền bằng C-bet (Continuation Bet): Khi bạn là người tố cược ở Preflop, bạn nắm quyền chủ động. Ở Flop dù bài bạn có trượt, bạn vẫn có thể cược nhẹ 1/3 hũ tiền để ép đối thủ fold ngay lập tức.

3. Bảng Phân Bổ Khoảng Bài Tẩy (Starting Hands Chart) Chuẩn Của CLB:
• Vị trí Đầu bàn (UTG / Early Position):
- Chỉ chơi: Đôi 77 trở lên (77, 88, 99, TT, JJ, QQ, KK, AA).
- Bài lá lớn: AK, AQ (cả đồng chất và khác chất), AJs, KQs.
- Hành động: Luôn Mở cược tố (Open Raise) 2.5BB - 3BB. Tuyệt đối không Limp!

• Vị trí Giữa bàn (Middle Position - MP):
- Mở rộng thêm: Đôi 55+, ATs, KJs, QJs, JTs.

• Vị trí Áp chót & Nút chia bài (Cutoff & Button):
- Mở rộng mạnh mẽ (đạt 25% - 30% dải bài): Toàn bộ các Đôi từ 22-AA, Ax đồng chất (A2s - A9s), KTs, QTs, JTs, T9s, 98s, 87s, ATo, KJo, QJo.
- Lý do: Button là vị trí có lợi thế tối thượng vì được hành động sau cùng trong mọi vòng cược sau Flop.

4. Cầu Nối Giúp Đọc Hiểu Tài Liệu Nâng Cao & Xem Video YouTube:
- Khi xem các video phân tích Hand trên kênh YouTube CLB, hãy để ý: Thầy Tidu luôn xác định vị trí ngồi và khoảng bài TAG trước khi đưa ra bất kỳ quyết định cược nào.
- Khi đọc các bài viết nâng cao dịch từ TwoPlusTwo hay CardsChat trên diễn đàn: Thuật ngữ "Solid TAG Regular" chính là chuẩn mực mà các cao thủ thế giới dùng để đo lường đối thủ. Nếu bạn chưa thuần thục TAG, bạn sẽ không thể áp dụng được các kỹ thuật phức tạp như Node-Locking hay Overbetting.`,
    gtoRecommendations: `• 3 Lời dặn dò xương máu của Thầy Tidu:
1. Đừng sốt ruột khi phải Fold bài liên tục: Kiên nhễn là đức tính số 1 của một tay chơi chiến thắng. Trong 100 ván, việc bạn fold 80 ván là hoàn toàn bình thường và đúng chuẩn chuyên nghiệp.
2. Từ bỏ hoàn toàn thói quen "Xem Flop cho vui": Bỏ 1BB để xem Flop với bài rác 9-4 hay J-3 là thói quen rò rỉ tiền tệ hại nhất của người mới.
3. Luôn ghi nhớ: Cược tấn công chủ động (Aggressive) giúp bạn tạo ra áp lực và làm chủ thế trận.`,
    keyTakeaways: [
      'TAG = Tight (Chọn lọc bài tẩy khắt khe) + Aggressive (Tấn công chủ động khi vào ván).',
      'Luôn ưu tiên chơi các bài mạnh ở vị trí Button và Cutoff để tận dụng lợi thế hành động sau cùng.',
      'Thuần thục TAG là điều kiện tiên quyết để hiểu các bài giảng video YouTube và tài liệu thế giới.'
    ],
    quizChallenge: {
      level: 2,
      levelName: 'Sói Tập Sự',
      levelIcon: '🐺',
      question: 'Theo tôn chỉ lối chơi TAG (Tight-Aggressive) của CLB, khi bạn mở cược tại Button và bị Big Blind Call, mặt Flop ra khô ráo [K cơ, 8 bích, 3 rô] và đối thủ Check, hành động chuẩn mực nhất là gì?',
      options: [
        'Check theo để xem lá Turn miễn phí cho an toàn',
        'Tố All-in ngay lập tức để đe dọa đối thủ',
        'Cược tiếp nối (C-bet) kích thước nhỏ 1/3 hũ để duy trì thế chủ động và dọn sạch bài rác của đối phương',
        'Bỏ bài Fold ngay vì sợ đối thủ phục kích Check-raise'
      ],
      correctIndex: 2,
      explanation: 'Chuẩn xác tư duy Sói Tập Sự! Phong cách TAG luôn nắm quyền chủ động. Cú C-bet 1/3 hũ trên mặt bài khô ráo ép Big Blind phải buông bỏ toàn bộ bài rác không dính Flop với chi phí cực kỳ tiết kiệm (+EV).'
    },
    comments: [
      {
        id: 'bl-clb-01',
        author: 'HocVien_TienPhong',
        authorBadge: 'Học viên CLB',
        authorRole: 'Học viên',
        avatarBg: 'bg-emerald-600',
        time: '2 giờ trước',
        content: 'Vừa xem xong video phân tích của Thầy Tidu trên kênh YouTube kết hợp đọc bài giáo trình này thì vỡ ra rất nhiều điều! Trước giờ em cứ tưởng đánh nhiều ván mới là hay, hóa ra chơi TAG kỷ luật mới là chân ái.',
        likes: 64
      },
      {
        id: 'bl-clb-02',
        author: 'MinhQuan_Poker',
        authorBadge: 'Biên tập viên CLB',
        authorRole: 'Biên tập',
        avatarBg: 'bg-blue-600',
        time: '5 giờ trước',
        content: 'Bảng hand chart cho từng vị trí rất trực quan và dễ nhớ cho học viên mới. Đề xuất anh em in ra hoặc lưu vào điện thoại để đối chiếu khi đánh thực hành!',
        likes: 45
      }
    ]
  },
  {
    id: 'bai-viet-clb-02',
    mainSection: 'giang-day-nghien-cuu',
    mainSectionName: '3. Lò Luyện Từ Gà Hóa Sói',
    category: 'giao-trinh-clb',
    categoryName: 'Giáo Trình Đào Tạo CLB',
    subForum: 'Đấu trường Sit & Go & Video thực hành',
    originalSource: 'Giáo trình đào tạo nội bộ CLB Học Poker (Đồng bộ Video Kênh YouTube Tidu)',
    title: '[Giáo Trình CLB - Bài 3] Sit & Go (SNG) Toàn Tập: Chiến lược đánh giải 1 bàn, quản lý chip 4 giai đoạn & Kỹ thuật săn tiền thưởng',
    author: 'Tidu',
    authorRole: 'Giảng viên',
    authorPosts: 54,
    authorJoinDate: '24/04/2017',
    publishedAt: 'Chủ đề ghim (Sticky CLB)',
    isSticky: true,
    gameType: 'Chiến thuật thi đấu giải Sit & Go 1 bàn',
    stakes: 'Môi trường thực hành chuẩn cho mọi học viên mới',
    views: 10980,
    replies: 64,
    likes: 710,
    youtubeUrl: 'https://www.youtube.com/results?search_query=chơi+Poker+Sit+and+Go+Tidu',
    youtubeTitle: 'Kênh YouTube Chơi Poker • Video Chiến Thuật Sit & Go (SNG) 1 Bàn',
    summary: 'Giáo trình huấn luyện Sit & Go (SNG 1 bàn 6-max hoặc 9-max) độc quyền của CLB: Tại sao SNG là bước đệm hoàn hảo nhất để rèn luyện tư duy thi đấu giải, cách chuyển đổi chiến thuật qua 4 giai đoạn (Đầu trận, Giữa trận, Bong bóng Bubble và Heads-up) kết hợp video hướng dẫn trên kênh YouTube CLB.',
    detailedAnalysis: `★ TẠI SAO HỌC VIÊN CLB NÊN BẮT ĐẦU VỚI SIT & GO (SNG)?
Trong các buổi sinh hoạt CLB và các video chia sẻ trên YouTube, Giảng viên Tidu luôn khuyên học viên mới: "Đừng vội lao vào các giải đấu nhiều bàn (MTT) hàng nghìn người chơi kéo dài 6-8 tiếng khiến bạn kiệt sức và dễ mắc lỗi. Hãy bắt đầu bằng giải Sit & Go (SNG 1 bàn từ 6 đến 9 người)!"
- Thời gian ngắn gọn (chỉ 30 - 50 phút một trận).
- Cấu trúc giải thưởng rõ ràng (Bàn 9 người thì Top 3 nhận tiền: Hạng nhất 50%, Hạng nhì 30%, Hạng ba 20%).
- Trải nghiệm trọn vẹn mọi cung bậc của một giải đấu: từ lúc nhiều chip đến khi mù tăng cao, áp lực sinh tử ở giai đoạn Bong bóng (Bubble) và kỹ năng đấu tay đôi (Heads-up).

1. Bốn Giai Đoạn Vàng Cần Thuộc Lòng Trong Giải SNG:

• Giai đoạn 1: ĐẦU TRẬN (Early Stage - Blinds nhỏ 10/20, 15/30, Chip sâu 60BB - 75BB)
- Mục tiêu: BẢO TOÀN LƯỢNG CHIP BAN ĐẦU.
- Chiến lược: Áp dụng triệt để lối chơi SIÊU CHẶT CHẼ (Ultra-Tight TAG). Chỉ tham gia với bài tẩy cao cấp (AA, KK, QQ, JJ, AK).
- Sai lầm người mới: Thấy blinds còn nhỏ nên ham vào xem Flop với các bài yếu (K9, J8, A3o). Đây là cách nhanh nhất đốt 20% lượng chip vào những tình huống dở khóc dở cười. Hãy nhớ: Mất chip ở đầu trận thì đau đớn, nhưng tích lũy thêm một vài chip nhỏ ở giai đoạn này không giúp bạn vô địch!

• Giai đoạn 2: GIỮA TRẬN (Middle Stage - Blinds tăng 50/100, 75/150, Ante xuất hiện, Chip còn 25BB - 40BB)
- Mục tiêu: CHUYỂN DỊCH SANG TẤN CÔNG & TÍCH LŨY CHIP.
- Chiến lược: Khi đối thủ bắt đầu chơi co cụm vì sợ bị loại, hãy tận dụng vị trí Cutoff và Button để Mở cược cướp tiền mù (Steal Blinds).
- Tìm kiếm các đối thủ chơi thụ động: Tố cược vào những người chơi hay fold bài để nhặt tiền mù và ante tích lũy mà không cần phải lật bài so điểm.

• Giai đoạn 3: GIAI ĐOẠN BONG BÓNG (The Bubble - Còn đúng 4 người tranh 3 suất nhận tiền)
- Mục tiêu: TẬN DỤNG TỐI ĐA ÁP LỰC TIỀN THƯỞNG (ICM).
- Đây là giai đoạn kịch tính nhất của Sit & Go. Người về hạng 4 ra về trắng tay ($0), người xếp hạng 3 nhận tiền thưởng!
- Kỹ thuật thi đấu:
  + Nếu bạn là Chipleader (Nhiều chip nhất): Hãy cược tố liên tục vào những người chơi có lượng chip trung bình (họ sợ bị loại nên sẽ fold bài cực kỳ nhiều).
  + Nếu bạn là Lượng chip trung bình: Tránh tối đa việc đối đầu tất tay với Chipleader. Hãy quan sát xem trên bàn có người ít chip (Short stack) sắp chết đói hay không để kiên nhẫn chờ họ bị loại trước.
  + Nếu bạn là Người ít chip nhất (Dưới 10BB): Chuyển sang chiến thuật Đẩy Tất Tay hoặc Bỏ Bài (Push / Fold Chart) chuẩn xác.

• Giai đoạn 4: VỀ ĐÍCH & ĐẤU TAY ĐÔI (In The Money & Heads-Up)
- Khi cả 3 người đều đã chắc chắn có tiền thưởng trong túi, áp lực ICM biến mất!
- Bây giờ bạn hoàn toàn có thể chơi phóng khoáng, mở rộng dải bài lên 50% - 70% để nhắm tới chiếc cúp vô địch (Hạng 1 ăn tới 50% tổng quỹ thưởng).

2. Hướng Dẫn Thực Hành Cùng Video YouTube Của CLB:
- Mở danh sách phát "Thực Chiến Sit & Go Cùng Thầy Tidu" trên YouTube.
- Trong lúc xem video, hãy tạm dừng (Pause) ở từng ván bài trước khi Thầy Tidu ra quyết định, tự hỏi mình: "Ở giai đoạn này của SNG, mình nên Fold, Raise hay Push All-in?". Sau đó bấm Play để xem Thầy giải thích lý do. Đây là phương pháp học phản xạ thực tế nhanh nhất!`,
    gtoRecommendations: `• Công thức vàng bỏ túi cho giải Sit & Go:
1. Giai đoạn đầu: Chơi chặt như tảng đá.
2. Giai đoạn giữa: Tấn công người nhát gan, cướp mù tích cực.
3. Giai đoạn Bubble: Nhận biết ai sợ bị loại để gây áp lực, bảo toàn mạng sống nếu không phải Chipleader.
4. Đấu tay đôi: Chủ động tấn công trước, không bao giờ nhường thế trận.`,
    keyTakeaways: [
      'Sit & Go là trường học tốt nhất để rèn giũa bản lĩnh giải đấu mà không tốn quá nhiều thời gian.',
      'Sự chuyển đổi nhịp nhàng từ Chặt chẽ (Đầu trận) sang Tấn công cướp mù (Giữa & Cuối trận) quyết định tỷ lệ lọt vào Top 3.',
      'ICM ở giai đoạn Bubble là vũ khí tối thượng giúp bạn kiếm tiền đều đặn trong SNG.'
    ],
    quizChallenge: {
      level: 3,
      levelName: 'Sói Thực Chiến',
      levelIcon: '⚔️',
      question: 'Trong giải Sit & Go (SNG) giai đoạn Cận tiền (Bubble - còn đúng 4 người, chỉ 3 người nhận tiền), bạn đang xếp thứ 2 chip và đối mặt cú đẩy All-in của người xếp thứ 3. Trên bàn có người xếp thứ 4 chỉ còn 3BB sắp chết đói. Bạn cầm [Át cơ, K bích], bạn nên quyết định ra sao?',
      options: [
        'Bỏ bài (Fold) ngay để bảo toàn mạng sống chip và chờ người ít chip nhất bị loại tự động',
        'Call ngay lập tức vì cầm Át-K (Big Slick) quá đẹp, không thể bỏ được',
        'Call vì tiền thưởng không quan trọng bằng ngôi vị số 1',
        'Nhắm mắt tất tay theo cảm tính hy vọng trúng Át ở Flop'
      ],
      correctIndex: 0,
      explanation: 'Xuất sắc bản lĩnh Sói Thực Chiến! Áp lực giải đấu ICM dạy ta: "Bảo toàn mạng sống chip quý hơn tích lũy thêm chip". Khi có kẻ sắp chết đói, việc 2 người xếp thứ 2 và 3 tử chiến với nhau là sai lầm sơ đẳng nhất. Fold AK ở đây mang lại lợi nhuận tiền thật khổng lồ (+EV).'
    },
    comments: [
      {
        id: 'bl-clb-03',
        author: 'DauTruong_SNG',
        authorBadge: 'Cao Thủ Chiến Thuật',
        authorRole: 'Cao Thủ Chiến Thuật',
        avatarBg: 'bg-amber-600',
        time: '4 giờ trước',
        content: 'Bài viết đúc kết chuẩn xác từng mili-mét về SNG! Ngày xưa em toàn all-in bậy ở vòng Bubble để rồi về hạng 4 ôm hận. Xem video của Thầy Tidu và áp dụng đúng 4 giai đoạn này là tỷ lệ vào Top 3 tăng vọt ngay.',
        likes: 58
      }
    ]
  },
  {
    id: 'bai-viet-clb-03',
    mainSection: 'giang-day-nghien-cuu',
    mainSectionName: '3. Lò Luyện Từ Gà Hóa Sói',
    category: 'giao-trinh-clb',
    categoryName: 'Giáo Trình Đào Tạo CLB',
    subForum: 'Lộ trình phát triển học viên',
    originalSource: 'Giáo trình đào tạo nội bộ CLB Học Poker (Đồng bộ Video Kênh YouTube Tidu)',
    title: '[Lộ Trình CLB] Khung giáo trình đào tạo 4 Cấp độ: Từ Học viên Nhập môn đến Đọc hiểu tài liệu thế giới',
    author: 'Tidu',
    authorRole: 'Giảng viên',
    authorPosts: 54,
    authorJoinDate: '24/04/2017',
    publishedAt: 'Chủ đề ghim (Sticky CLB)',
    isSticky: true,
    gameType: 'Lộ trình đào tạo toàn diện của CLB',
    stakes: 'Dành cho mọi học viên theo dõi kênh YouTube & Diễn đàn',
    views: 8940,
    replies: 53,
    likes: 620,
    youtubeUrl: 'https://www.youtube.com/results?search_query=chơi+Poker+Tidu',
    youtubeTitle: 'Kênh YouTube Chơi Poker • Video Lộ Trình 4 Cấp Độ Đào Tạo',
    summary: 'Bản đồ lộ trình học tập 4 cấp độ được thiết kế độc quyền bởi Giảng viên Tidu. Giúp học viên định vị chính xác trình độ hiện tại, kết hợp xem video YouTube, học giáo trình CLB và đọc hiểu các bài dịch chuyên sâu từ TwoPlusTwo, CardsChat và PokerStrategy.',
    detailedAnalysis: `★ LỘ TRÌNH 4 CẤP ĐỘ ĐÀO TẠO NỘI BỘ CLB HỌC POKER:

• CẤP ĐỘ 1: GÀ MỚI NHẬP ĐÀN (🐣 Nhập Môn & Thiết Lập Tư Duy Nền Tảng)
- Đối tượng: Người chưa biết gì hoặc mới chơi dưới 3 tháng.
- Nội dung học:
  1. Luật chơi chung, thứ tự sức mạnh các bộ bài 52 lá (Xem bài ghim của Thầy Tidu).
  2. Hiểu rõ giá trị của Vị trí (Dealer Button, Cutoff, Blinds) và 4 vòng cược (Preflop, Flop, Turn, River).
  3. Tính toán Pot Odds cơ bản (Tỷ lệ cược so với hũ tiền).
- Kênh học tập: Loạt video "Poker Nhập Môn Cho Người Chưa Biết Gì" trên kênh YouTube CLB.

• CẤP ĐỘ 2: SÓI TẬP SỰ (🐺 Thuần Thục Lối Chơi TAG & Thực Hành Sit & Go)
- Đối tượng: Học viên đã nắm luật, muốn bắt đầu chơi có kỷ luật và kiếm lợi nhuận.
- Nội dung học:
  1. Nằm lòng Bảng bài tẩy khởi đầu (Starting hands chart) theo từng vị trí (Giáo trình Bài 1).
  2. Kỹ thuật C-bet (Cược tiếp nối 1/3 hũ) và Tấn công chủ động thay vì Call thụ động.
  3. Chiến thuật 4 giai đoạn trong giải Sit & Go 1 bàn (Giáo trình Bài 2).
- Kênh học tập: Danh sách phát "Chiến Thuật Sit & Go & Phong Cách TAG Thực Chiến" trên YouTube CLB.

• CẤP ĐỘ 3: SÓI THỰC CHIẾN (⚔️ Bàn Tiền Mặt Cash Games & Quản Lý Tiền Vốn Thép)
- Đối tượng: Học viên bắt đầu tham gia các bàn Cash Games 6-max hoặc MTT nhiều bàn.
- Nội dung học:
  1. Kỹ năng 3-Bet / 4-Bet và bảo vệ tiền mù tại Small Blind & Big Blind.
  2. Kỹ thuật Chặn bài (Blocker) và cược dồn ép lừa dối (Triple Barrel Bluff).
  3. Kỷ luật quản lý vốn 50-70 Buy-ins và kiểm soát tâm lý khi gặp chuỗi thua (Downswing).
- Kênh học tập: Video phân tích Hand History chuyên sâu trên YouTube và chuyên mục Bàn tiền mặt trên diễn đàn.

• CẤP ĐỘ 4: SÓI ĐẦU ĐÀN (👑 Làm Chủ Solver GTO & Phản Biện Tài Liệu Đỉnh Cao)
- Đối tượng: Học viên muốn tiến lên trình độ bán chuyên nghiệp và chuyên nghiệp.
- Nội dung học:
  1. Đọc và phản biện các ván bài tranh luận từ TwoPlusTwo Forum và CardsChat.
  2. Áp dụng kỹ thuật Khóa nút (Node-Locking) để khai thác tối đa điểm yếu của đối thủ.
  3. Sử dụng kích thước cược hình học và Cược vượt hũ (Overbet 125%-150%) theo trường phái PokerStrategy.
- Kênh học tập: Các chuyên mục Toán học GTO, Giải đấu và Cash Games trên diễn đàn "Chơi Poker".`,
    gtoRecommendations: `• Lời dặn từ Ban Chủ Nhiệm CLB:
- "Học Poker cũng giống như xây một tòa nhà cao tầng: Móng có chắc thì nhà mới cao. Hãy kiên nhẫn đi từng bước từ Cấp độ 1 lên Cấp độ 4, đừng đốt cháy giai đoạn!"
- Bất kỳ khi nào gặp ván bài khó hiểu trong quá trình chơi, hãy đăng tải lịch sử ván bài (Hand History) lên diễn đàn để Giảng viên Tidu và cộng đồng hỗ trợ phân tích miễn phí.`,
    keyTakeaways: [
      'Lộ trình 4 cấp độ rõ ràng giúp học viên không bị lạc lối giữa biển thông tin.',
      'Sự kết hợp giữa Video YouTube trực quan và Giáo trình nội bộ trên diễn đàn tạo ra hiệu quả học tập gấp 3 lần.',
      'Thường xuyên gửi ván đấu thực tế lên diễn đàn là cách nhanh nhất để sửa lỗi tư duy.'
    ],
    quizChallenge: {
      level: 4,
      levelName: 'Sói Đầu Đàn',
      levelIcon: '👑',
      question: 'Khi sử dụng Solver GTO trong phân tích chuyên sâu, kỹ thuật Khóa nút (Node-Locking) được các cao thủ Sói Đầu Đàn ứng dụng nhằm mục đích cốt lõi gì?',
      options: [
        'Cố định lối đánh cân bằng lý thuyết thuần túy mà không thay đổi theo đối thủ',
        'Khóa các hành động sai lầm thực tế của đối thủ (như fold quá nhiều hoặc call quá đà) để máy tính tìm ra phương án khai thác triệt để nhất (+EV tối đa)',
        'Khóa ván bài để người chơi khác không xem được',
        'Chỉ dùng để tính toán may rủi đỏ đen'
      ],
      correctIndex: 1,
      explanation: 'Xuất sắc đỉnh cao Sói Đầu Đàn! Pure GTO là lối đánh không thể bị khai thác, nhưng Node-Locking mới là đỉnh cao thực chiến kiếm tiền: bắt lỗi đối thủ cụ thể và trừng phạt tối đa để biến sai lầm của họ thành lợi nhuận của mình!'
    },
    comments: [
      {
        id: 'bl-clb-04',
        author: 'ThanhVien_MoiGiaNhap',
        authorBadge: 'Học viên CLB',
        authorRole: 'Học viên',
        avatarBg: 'bg-purple-600',
        time: '1 giờ trước',
        content: 'Cảm ơn Thầy Tidu đã vạch ra lộ trình học quá chi tiết! Em đang ở Cấp độ 2, sẽ cố gắng luyện thật nhuyễn TAG và SNG trước khi chuyển sang Cấp độ 3.',
        likes: 41
      }
    ]
  },
  {
    id: 'bai-viet-01',
    mainSection: 'tong-hop-dien-dan',
    mainSectionName: '1. Trạm Tình Báo Quốc Tế',
    category: 'cash-online',
    categoryName: 'Bàn Đánh Tiền Mặt (Cash Games)',
    subForum: 'Bàn 6-max tốc độ cao (Zoom)',
    originalSource: 'TwoPlusTwo Forum (forumserver.twoplustwo.com - 2025/2026)',
    title: 'Bàn tiền mặt NL500: Cược dồn 3 vòng liên tiếp với Át chặn Thùng tối cao - Khi nào nên All-in ở River?',
    author: 'ChuyenGia_NL500',
    authorRole: 'Cao Thủ Chiến Thuật',
    authorPosts: 742,
    authorJoinDate: '12/03/2019',
    publishedAt: 'Mới đăng hôm nay (Cập nhật 2026)',
    gameType: 'Poker Trực Tuyến - Bàn 6-max NL500 Zoom',
    stakes: 'Mức cược: $2 / $5 ($500 Buy-in, Độ sâu tiền 100BB)',
    formatTags: ['online', 'cash'],
    views: 4120,
    replies: 56,
    likes: 215,
    summary: 'Phân tích chuyên sâu bàn tiền mặt cược cao: Cách tối ưu hóa cú cược dồn ép lừa dối (Triple Barrel Bluff) ở vòng River khi bạn cầm lá Át chặn thùng bài tối cao trên mặt bài ghép đôi.',
    handHistory: `[Bàn chơi 6-Max Trực Tuyến NL500]
- Hero (Vị trí Button): Cầm $560 giữ bài [Át bích, K rô]
- Villain (Vị trí UTG): Cầm $590 - Reg chơi chuẩn, kỷ luật 22/18.

• Preflop: UTG mở cược $12.5. Fold tới Hero tại Button tố thêm 3-bet lên $42. Blinds fold. UTG Call. (Pot: $91)
• Flop: [Q bích, 8 bích, 4 tép]
UTG Check. Hero C-bet 1/3 Pot ($30). UTG Call. (Pot: $151)
• Turn: [2 rô] (Mặt bài: Q bích, 8 bích, 4 tép, 2 rô)
UTG Check. Hero cược tiếp tục 70% Pot ($105). UTG Call. (Pot: $361)
• River: [8 tép] (Mặt bài hoàn thiện: Q bích, 8 bích, 4 tép, 2 rô, 8 tép)
UTG Check. Hero còn lại $383 tiền sau lưng. Hũ tiền đang có $361.`,
    detailedAnalysis: `[1. Ngoại cảnh & Tương quan bàn chơi: Giai đoạn giải, độ sâu Stack, vị trí, tâm lý đối thủ]
- Thể loại: Bàn tiền mặt trực tuyến 6-Max NL500 Zoom tốc độ cao ($2/$5).
- Độ sâu Stack: Hero cầm $560 (112BB) tại vị trí Nút chia bài (Button). Villain cầm $590 (118BB) tại vị trí Đầu bàn (UTG). Cả hai đều có stack sâu tiêu chuẩn.
- Tâm lý & Xu hướng đối thủ: Villain là một người chơi chuyên nghiệp (Regular) chơi chuẩn chỉ, kỷ luật (chỉ số 22/18), có thói quen bảo vệ đôi cao nhưng lại rất ngại những cú đẩy tất tay ở River nếu mặt bài nguy hiểm.

[2. Diễn biến hành động các vòng: Preflop, Flop, Turn, River]
• Preflop (Vòng 2 lá đầu): UTG mở cược chuẩn $12.5. Các vị trí giữa bỏ bài. Hero tại Button cầm [Át bích, K rô] thực hiện cú tố thêm lần 3 (3-bet) lên $42 để lấy vị trí và thế chủ động. Cả 2 mù bỏ bài. UTG theo cược (Call). Hũ tiền: $91.
• Flop (Vòng 3 lá chung) [Q bích, 8 bích, 4 tép]: UTG nhường lượt (Check). Hero cược tiếp nối (C-bet) 1/3 hũ ($30) nhằm gây áp lực lên các đôi nhỏ. UTG tiếp tục Call. Hũ tiền: $151.
• Turn (Vòng lá thứ 4) [2 rô]: Mặt bài không có nhiều biến đổi. UTG Check. Hero quyết định cược dồn tiếp 70% hũ ($105) để đại diện cho bài cực mạnh (Overpair AA, KK hoặc set Q). UTG suy nghĩ rồi Call tiếp. Hũ tiền: $361.
• River (Vòng lá cuối cùng) [8 tép]: Mặt bài xuất hiện đôi 8. UTG Check vòng thứ 3 liên tiếp. Hero còn lại $383 tiền sau lưng. Hũ tiền $361 (chỉ số SPR ~ 1.06). Quyết định: All-in vượt hũ nhẹ $383 hay Check bỏ cuộc?

[3. Góc nhìn từ cộng đồng quốc tế]
- Diễn đàn TwoPlusTwo (High Stakes NL section):
  + Phe tấn công (Pro Regs): Ủng hộ cú cược ép lừa dối All-in (Triple Barrel Bluff Shove). Lý do cốt tử: Hero đang cầm Át bích - lá bài chặn (Blocker) tối thượng triệt tiêu hoàn toàn khả năng đối thủ cầm bài mua Thùng hỏng. Khi mặt bài ghép đôi 8 ở River, số tổ hợp bài mạnh của UTG thực chất bị giảm đi một nửa (chỉ còn 1 tổ hợp đôi 8). Đối thủ cầm Đôi Q (AQ, KQ) đối mặt cú đẩy $383 vào hũ $361 sẽ buộc phải Fold hơn 65% tần suất.
  + Phe phòng thủ: Cảnh báo nguy cơ đối thủ là "Calling Station" không chịu buông Top Pair và Hero sẽ mất trắng $383 không cần thiết.
  + Mô hình GTO Solver: Khuyến nghị Shove 75% với [Át bích, K rô], nhưng nếu cầm [Át cơ, K rô] thì chỉ Shove 15% vì không có tác dụng chặn thùng.

[4. Đúc kết thực chiến chuẩn CLB để kiếm ăn ổn định]
- Bài học số 1: "Không cầm Blocker thì đừng bao giờ dại dột cược dồn 3 vòng lừa dối". Lá Át bích trong tay bạn chính là tấm khiên bảo vệ cú Bluff thành công.
- Bài học số 2: Lá bài đôi nhỏ/trung bình ở River là lá bài an toàn (Blank) để cược ép, vì nó không giúp ích gì cho khoảng bài Call 2 vòng của đối thủ.
- Thực chiến kiếm ăn: Nếu gặp đối thủ là người chơi Việt Nam ham Call (Fish/Station), TUYỆT ĐỐI không Bluff ở spot này, hãy chỉ Check so điểm. Nhưng nếu gặp Regs đánh kỷ luật, cú All-in này mang lại tỷ lệ thắng tiền dài hạn (+EV) cực kỳ khủng khiếp!`,
    gtoRecommendations: `• Khuyến nghị GTO chuẩn mực:
- Bài Át bích K rô là tổ hợp Bluff All-in chuẩn xác nhất trong toàn bộ dải bài của Hero ở spot này (tần suất Shove 75%, Check 25%).
- Nếu bạn không cầm Át bích (ví dụ cầm Át cơ K rô), tần suất Shove giảm xuống dưới 15% vì bạn không chặn được các bài mua thùng hỏng của đối thủ.`,
    keyTakeaways: [
      'Lá bài chặn (Blocker) Át cùng chất là điều kiện tiên quyết cho cú cược dồn ép lừa dối ở vòng cuối.',
      'Mặt bài ghép đôi lá bài nhỏ/trung bình ở River làm giảm số lượng bài cực mạnh của đối phương chứ không tăng lên.'
    ],
    proInteractions: [
      {
        id: 'pro-2p2-01',
        proName: 'Tom_Dwan_Fan',
        proRole: '2+2 High Stakes Veteran (12.450 bài)',
        proAvatarBg: 'bg-rose-700',
        forumSource: 'TwoPlusTwo',
        stance: 'shove',
        stanceLabel: '🔥 Ủng hộ Shove All-in 100%',
        stanceColor: 'bg-rose-950 text-rose-300 border-rose-600',
        quote: 'Hero cầm As triệt tiêu hoàn toàn bài Flush Draw, UTG bắt buộc phải fold over 65% tổ hợp AQ/KQ!',
        content: 'Tôi hoàn toàn ủng hộ cú Triple Barrel Shove này! Cốt lõi của ván bài nằm ở lá Át bích (As blocker). Khi River ghép đôi 8, số combo 88 của UTG chỉ còn duy nhất 1 combo. Toàn bộ dải bài Call Flop và Turn của đối thủ chủ yếu là AQ, KQ, QJs và các bài mua Thùng ngửa. Với việc Hero chặn lá Át bích, UTG không thể có Nut Flush Draw biến thành Call bluff-catcher. Đối mặt với cú đẩy $383 vào pot $361 ở River, ngay cả các Regs cứng tay nhất cũng phải ngậm ngùi buông đôi Q. Đừng bao giờ Check ở đây để đối thủ ngửa AQ ăn hũ!',
        likes: 89,
        timeAgo: '4 giờ trước trên TwoPlusTwo'
      },
      {
        id: 'pro-2p2-02',
        proName: 'ChicagoJoey_Pro',
        proRole: 'NL1000 Grinder & Podcaster (8.920 bài)',
        proAvatarBg: 'bg-amber-600',
        forumSource: 'TwoPlusTwo',
        stance: 'exploit',
        stanceLabel: '🎯 Cảnh Báo Khai Thác Đối Thủ',
        stanceColor: 'bg-amber-950 text-amber-300 border-amber-600',
        quote: 'Lý thuyết rất đẹp nhưng nếu UTG là calling station hoặc recreational player thì Shove là ném tiền qua cửa sổ!',
        content: 'Đồng ý về mặt toán học với anh em phe Shove. Nhưng hãy nhớ đây là bàn Zoom tốc độ cao! Nếu Villain có chỉ số WTSD (Went to Showdown) trên 32% hoặc có xu hướng yêu thích đôi Q của mình (Hero call syndrome), họ sẽ bấm Call và nói "Tôi không tin ông có 8 hoặc Set". Cú bluff này chỉ +EV khi bạn dám chắc đối thủ là người chơi kỷ luật biết Bỏ bài. Nếu có bất kỳ nghi ngờ nào về việc đối thủ là Trạm Thu Phí (Calling station), hãy Check và giữ lại $383 cho ván sau.',
        likes: 64,
        timeAgo: '3 giờ trước trên TwoPlusTwo'
      },
      {
        id: 'pro-2p2-03',
        proName: 'GTO_MathWizard',
        proRole: 'MonkerSolver Lab Analyst (3.410 bài)',
        proAvatarBg: 'bg-blue-600',
        forumSource: 'TwoPlusTwo',
        stance: 'gto',
        stanceLabel: '🧠 Solver Khuyến Nghị 74.8% Shove',
        stanceColor: 'bg-blue-950 text-blue-300 border-blue-600',
        quote: 'MonkerSolver chạy 100 iterations/node cho kết quả EV của Shove với AsKd là +18.4BB so với 0BB của Check!',
        content: 'Tôi vừa đưa toàn bộ Node vào MonkerSolver với độ sâu 100BB: Solver chọn Shove 74.8% tần suất với tổ hợp AsKd. Lý do: As là blocker số 1 triệt hạ dải bài đối thủ. Ngược lại, nếu bạn đổi sang AcKd (Át cơ không chặn thùng bích), Solver ngay lập tức giảm tần suất Shove xuống 11.2% và chuyển sang Check 88.8%. Điều đó chứng minh: Shove ở đây là chuẩn khoa học, nhưng điều kiện tiên quyết là phải có đúng chất bài Blocker!',
        likes: 112,
        timeAgo: '2 giờ trước trên TwoPlusTwo'
      },
      {
        id: 'pro-2p2-04',
        proName: 'VegasLiveReg',
        proRole: 'Live High Stakes Las Vegas (5.600 bài)',
        proAvatarBg: 'bg-purple-600',
        forumSource: 'TwoPlusTwo',
        stance: 'call',
        stanceLabel: '🛡️ Góc Nhìn Người Cầm Q ở UTG',
        stanceColor: 'bg-purple-950 text-purple-300 border-purple-600',
        quote: 'Nếu tôi ngồi ở vị trí UTG cầm AQ, đối mặt cú đẩy River này tôi sẽ bấm giờ đến giây cuối cùng rồi đau đớn Fold!',
        content: 'Từ góc nhìn người phòng thủ: Tôi đã Call 2 vòng Flop và Turn. Khi River ra con 8 thứ hai, pot phình lên $361. Nếu Hero đẩy $383, Hero đang đại diện cho AA, KK, QQ, hoặc 88. Dải bài Bluff duy nhất của Hero mà tôi có thể nghĩ ra là các bài như AKs, AJ bích trượt thùng. Nhưng vì pot odds chỉ là $383 / ($383 + $361 + $383) ~ 34%, tôi cần thắng hơn 1 trong 3 lần. Cầm AQ ở đây là một cú Bỏ bài cực kỳ đau lòng nhưng hầu hết Regs sẽ Fold.',
        likes: 53,
        timeAgo: '1 giờ trước trên TwoPlusTwo'
      },
      {
        id: 'pro-2p2-05',
        proName: 'Dan_Bilmzerian_Slayer',
        proRole: '2+2 MTT & Cash Specialist (9.840 bài)',
        proAvatarBg: 'bg-indigo-600',
        forumSource: 'TwoPlusTwo',
        stance: 'exploit',
        stanceLabel: '🎯 Phản Biện Khả Năng Đối Thủ Bẫy Set',
        stanceColor: 'bg-amber-950 text-amber-300 border-amber-600',
        quote: 'Liệu UTG có bao giờ bẫy Set 44 hoặc Q-8 từ Flop để nhử cú Shove River của bạn?',
        content: 'Rất nhiều anh em ca ngợi lá Át bích blocker mà quên mất một rủi ro: Nếu UTG là cao thủ đánh chậm (Slowplay/Trap), họ hoàn toàn có thể Check-Call 2 vòng với Bộ ba 44 hoặc Q8 hai đôi để nhử bạn cược dồn 3 barrel! Tại sao UTG không Raise ở Flop hoặc Turn? Vì họ biết bạn cầm Button 3-bet range rất hung hãn. Tuy nhiên, điểm cốt tử là số lượng tổ hợp bài Trap rất ít so với tổ hợp bài AQ/KQ. Do đó, cú Shove này vẫn là +EV nếu xét về dải bài tổng thể, nhưng bạn phải chuẩn bị tâm lý chấp nhận xác suất 15-20% bị ngửa bài đè!',
        likes: 71,
        timeAgo: '50 phút trước trên TwoPlusTwo'
      },
      {
        id: 'pro-2p2-06',
        proName: 'MicroGrinder_VN',
        proRole: 'Biên tập viên Chơi Poker (Học viên khóa 2017)',
        proAvatarBg: 'bg-emerald-600',
        forumSource: 'TwoPlusTwo',
        stance: 'call',
        stanceLabel: '🛡️ Cảnh Báo Cho Người Chơi Bàn Nhỏ',
        stanceColor: 'bg-purple-950 text-purple-300 border-purple-600',
        quote: 'Ở bàn cược nhỏ Micro, đối thủ cầm Top Pair sẽ không bao giờ bấm nút Fold!',
        content: 'Bài học rút ra cho anh em cày bàn nhỏ ở Việt Nam: Ván bài này xảy ra ở NL500 Zoom - nơi các Pro Regs chơi kỷ luật và biết sợ cú Shove ở River. Nếu anh em đem y nguyên line này áp dụng vào bàn NL5 hay NL10, đảm bảo 90% đối thủ sẽ ngửa Top Pair yếu (QJ, Q10) và Call tới bến với suy nghĩ "Biết đâu nó bluff". Tuyệt đối không bluff cược dồn 3 vòng nếu không biết rõ đối thủ có khả năng Bỏ bài!',
        likes: 94,
        timeAgo: '30 phút trước trên TwoPlusTwo'
      },
      {
        id: 'pro-2p2-07',
        proName: 'Mental_Coach_Jared',
        proRole: 'Tâm Lý Học Poker Thực Chiến (6.320 bài)',
        proAvatarBg: 'bg-cyan-600',
        forumSource: 'TwoPlusTwo',
        stance: 'gto',
        stanceLabel: '🧠 Bản Lĩnh Tâm Lý Khi Bấm Shove',
        stanceColor: 'bg-cyan-950 text-cyan-300 border-cyan-600',
        quote: 'Điểm yếu lớn nhất không nằm ở lá bài, mà là sự run tay và hội chứng tiếc tiền của người chơi.',
        content: 'Về mặt tâm lý học: Rất nhiều người chơi hiểu lý thuyết Blocker và GTO, nhưng khi ngồi trước màn hình với pot $361 và phải bấm All-in $383 tiền thật, họ bắt đầu bị cảm xúc chi phối: "Nếu họ call thì mình mất trắng cả buổi cày cuốc". Họ chọn Check và tự bào chữa là đánh an toàn. Nhưng chính sự an toàn nửa vời đó biến bạn thành người chơi thua tiền dài hạn (-EV). Nếu bạn đã chọn line 3-barrel, bạn phải có dũng khí thực thi nó đến cùng!',
        likes: 135,
        timeAgo: '15 phút trước trên TwoPlusTwo'
      }
    ],
    comments: [
      {
        id: 'bl-2p2-01',
        author: 'RedChip_Pro',
        authorBadge: 'Cao Thủ Chiến Thuật',
        authorRole: 'Cao Thủ Chiến Thuật',
        avatarBg: 'bg-amber-600',
        time: '3 giờ trước',
        content: 'Phân tích rất chuẩn mực theo meta 2026! Rất nhiều người chơi trung cấp sợ lá đôi ở River mà bỏ lỡ cơ hội Shove ăn tiền hũ $361.',
        likes: 38
      }
    ]
  },
  {
    id: 'bai-viet-02',
    mainSection: 'giang-day-nghien-cuu',
    mainSectionName: '3. Lò Luyện Từ Gà Hóa Sói',
    category: 'toan-hoc',
    categoryName: 'Toán Học & Lý Thuyết GTO',
    subForum: 'Mô hình Solver & Lối đánh tối ưu',
    originalSource: 'TwoPlusTwo Forum (forumserver.twoplustwo.com - Lý Thuyết Poker)',
    title: 'Kỹ thuật Node-Locking trong Solver 2026: Cách trừng phạt đối thủ Fold quá mức trước C-bet Flop',
    author: 'SolverMaster_VN',
    authorRole: 'Biên tập',
    authorPosts: 388,
    authorJoinDate: '19/11/2020',
    publishedAt: 'Mới đăng hôm qua',
    gameType: 'Lý thuyết chuyên sâu GTO & Node-Locking',
    stakes: 'Áp dụng cho mọi mức cược từ Micro tới High Stakes',
    views: 3890,
    replies: 47,
    likes: 270,
    summary: 'Lối chơi cân bằng thuần túy (Pure GTO) đôi khi bỏ lỡ rất nhiều tiền nếu đối thủ có lỗ rò rỉ (leak). Hướng dẫn dùng Node-Locking để tối đa hóa tỷ lệ cược ăn tiền tức thì.',
    detailedAnalysis: `1. Thực trạng người chơi trực tuyến hiện nay:
- Đa số người chơi ở mức cược nhỏ và vừa fold trước cược tiếp nối (C-bet) ở Flop với tần suất 52% - 58%, cao hơn rất nhiều so với tần suất chuẩn GTO (khoảng 38% - 42%).
- Khi đối thủ fold quá nhiều, việc chúng ta tiếp tục đánh theo Solver cân bằng là tự đánh mất kỳ vọng lợi nhuận (+EV).

2. Kết quả khi khóa nút (Node-Locking) đối thủ Fold nhiều:
- Solver lập tức điều chỉnh chiến thuật của Hero: Chuyển từ tần suất C-bet 60% lên C-bet 100% toàn bộ dải bài (Any two cards) với kích thước cược nhỏ 25% - 33% Pot!
- Chỉ cần cược 33% hũ tiền, bạn chỉ cần đối thủ fold 25% là nước cược đã tự động có lãi ngay lập tức mà không cần quan tâm lá bài trên tay là gì!`,
    gtoRecommendations: `• Công thức tính điểm hòa vốn C-bet nhanh:
- Tỷ lệ đối thủ cần Fold = Kích thước cược / (Kích thước cược + Hũ tiền hiện tại).
  + Cược 1/3 hũ: Cần fold 25%.
  + Cược 1/2 hũ: Cần fold 33%.
  + Cược 3/4 hũ: Cần fold 43%.
- Bất cứ khi nào bạn nhận thấy đối thủ fold nhiều hơn con số này, hãy tăng tần suất cược ép họ phải buông bài!`,
    keyTakeaways: [
      'Pure GTO giúp bạn không bị thua, nhưng Lối đánh khai thác (Exploitative) mới mang lại lợi nhuận cao nhất.',
      'Cược 25% - 33% hũ trên các mặt bài khô (A-7-2, K-8-3) mang lại lợi nhuận tự động cực lớn trước đối thủ thụ động.'
    ],
    comments: [
      {
        id: 'bl-2p2-02',
        author: 'ToanHoc_Poker',
        authorBadge: 'Giảng viên',
        authorRole: 'Giảng viên',
        avatarBg: 'bg-amber-600',
        time: '5 giờ trước',
        content: 'Bài viết rất xuất sắc! Node-locking chính là vũ khí giúp biến lý thuyết khô khan thành dòng tiền thực tế.',
        likes: 42
      }
    ]
  },
  {
    id: 'bai-viet-03',
    mainSection: 'tong-hop-dien-dan',
    mainSectionName: '1. Trạm Tình Báo Quốc Tế',
    category: 'giai-dau',
    categoryName: 'Giải Đấu Poker (Tournaments / MTT)',
    subForum: 'Chiến thuật Bàn chung kết',
    originalSource: 'CardsChat Forum (cardschat.com/forum - 2025/2026)',
    title: 'Áp lực bảo toàn tiền thưởng tại Bàn chung kết: Có nên theo cú All-in khi cầm Át-K?',
    author: 'ChuyenGia_MTT',
    authorRole: 'Cao Thủ Chiến Thuật',
    authorPosts: 512,
    authorJoinDate: '08/07/2019',
    publishedAt: 'Mới đăng tuần này',
    gameType: 'Đấu giải MTT trực tuyến - Bàn chung kết',
    stakes: 'Buy-in $109 - Còn lại 10 người / 4.200 người tham gia',
    formatTags: ['online', 'tournament'],
    views: 3740,
    replies: 68,
    likes: 230,
    summary: 'Tình huống kinh điển trong giải đấu MTT: Tại sao cầm bài siêu mạnh Át-K (Big Slick) lại phải Bỏ bài (Fold) ngay lập tức khi đối mặt với cú đẩy All-in trước ngưỡng cửa Final Table?',
    handHistory: `[Giải Đấu Trực Tuyến: Còn đúng 10 người - Ngưỡng cửa Bàn chung kết]
- Bậc thang tiền thưởng (Payjump): Hạng 10 nhận $4.200 | Vô địch nhận $85.000.
- Tình trạng chip của các người chơi:
  + Chipleader: 80BB
  + Hero: 45BB (Vị trí Button, nhiều chip thứ nhì)
  + Small Blind: 38BB (Người chơi nhiều chip thứ ba, rất kỷ luật)
  + 6 người chơi còn lại: Rất ít chip, chỉ từ 5BB đến 11BB và đang sắp bị loại (Short stacks)!

• Diễn biến:
Fold tới Hero tại Button cầm [Át cơ, K bích]. Hero mở cược tối thiểu 2.0BB.
Small Blind lập tức đẩy cược tất tay All-in toàn bộ 38BB! Big Blind fold.
Hero phải đưa ra quyết định với bài Át-K.`,
    detailedAnalysis: `[1. Ngoại cảnh & Tương quan bàn chơi: Giai đoạn giải, độ sâu Stack, vị trí, tâm lý đối thủ]
- Thể loại: Giải đấu Poker trực tuyến nhiều bàn (MTT Buy-in $109) với 4.200 người tham gia.
- Giai đoạn: Ngưỡng cửa Bàn chung kết (Final Table Bubble - còn đúng 10 người). Bậc thang tiền thưởng (Payjump) khổng lồ: Hạng 10 nhận $4.200, trong khi Vô địch nhận $85.000.
- Độ sâu Stack: Hero có 45BB (xếp thứ nhì toàn giải). Small Blind có 38BB (xếp thứ ba toàn giải). Đặc biệt, 6 người chơi ở bàn còn lại đang "sắp chết đói chip" chỉ còn từ 5BB đến 11BB!
- Vị trí & Tâm lý đối thủ: Hero ngồi Button - vị trí quyền lực nhất bàn. Small Blind là người chơi cực kỳ kinh nghiệm, đánh kỷ luật, hiểu sâu về mô hình toán học giải đấu ICM.

[2. Diễn biến hành động các vòng: Preflop, Flop, Turn, River]
• Preflop (Vòng 2 lá đầu): 7 người trước đều bỏ bài. Hero tại Button nhìn thấy [Át cơ, K bích] (bài siêu mạnh) và mở cược tối thiểu (Min-raise) 2.0BB để cướp mù.
Bất ngờ, Small Blind suy nghĩ 10 giây rồi đẩy cược tất tay All-in toàn bộ 38BB! Big Blind bỏ bài.
Lúc này, quyết định dồn vào tay Hero: Bỏ bài (Fold) hay Theo cược (Call)?
(Ván bài kết thúc ngay tại Preflop vì đây là quyết định sống còn của cả giải đấu).

[3. Góc nhìn từ cộng đồng quốc tế]
- Diễn đàn CardsChat (Mục Tournament MTT Strategy):
  + Nhóm nghiệp dư: Cho rằng AK là "bài tẩy siêu phẩm" (Big Slick), mở cược Button mà bị đẩy All-in thì phải Call ngay để tranh ngôi Chipleader.
  + Nhóm cao thủ giải đấu: Chỉ trích kịch liệt việc Call. Dưới áp lực ICM khi có tới 6 stack siêu ngắn sắp bị loại tự động, việc Call ở đây là "tự sát tài chính".
  + Mô hình toán học ICM: Nếu Call và thua, Hero rơi xuống 7BB và mất cơ hội cầm chắc hàng chục ngàn USD. Nếu Call và thắng, giá trị quy đổi tiền mặt thực tế chỉ tăng thêm 15%, trong khi đối đầu dải bài đẩy của SB (AA, KK, QQ, AK), tỷ lệ thắng của AK chỉ từ 38% - 40%. Solver kết luận: FOLD 100% (chỉ Call duy nhất với đôi Át AA).

[4. Đúc kết thực chiến chuẩn CLB để kiếm ăn ổn định]
- Bài học số 1: "Tiền trong túi quan trọng hơn cái tôi trên bàn cờ". Đừng bao giờ biến một ván bài đẹp thành thảm họa vì tiếc rẻ lá Át-K.
- Bài học số 2: Nguyên tắc sinh tồn giải đấu: Khi có người sắp chết trước, việc của bạn là ngồi im để nhận tiền thưởng bậc thang tự động rơi vào tài khoản. Không bao giờ để 2 người xếp thứ 2 và thứ 3 tử chiến với nhau!
- Thực chiến kiếm ăn: Đây là bí quyết giúp các học viên CLB lọt sâu vào Top 3 của các giải đấu lớn thay vì dừng chân cay đắng ở vị trí thứ 9-10.`,
    gtoRecommendations: `• Khuyến nghị sách giáo khoa giải đấu:
- FOLD 100% NGAY LẬP TỨC!
- Đây là cú Bỏ bài bắt buộc để bảo toàn giá trị tiền thưởng thực tế. Bạn chỉ có thể Call trong tình huống này với đúng đôi Át (AA).`,
    keyTakeaways: [
      'Tại ngưỡng cửa Bàn chung kết, giữ gìn mạng sống chip quan trọng gấp bội lần tích lũy thêm chip.',
      'Không bao giờ để 2 người xếp thứ 2 và thứ 3 tử chiến với nhau khi có nhiều người sắp chết đói chip.'
    ],
    proInteractions: [
      {
        id: 'pro-cc-01',
        proName: 'CardsChat_LeadCoach',
        proRole: 'CardsChat Head MTT Coach (14.200 bài)',
        proAvatarBg: 'bg-emerald-600',
        forumSource: 'CardsChat',
        stance: 'fold',
        stanceLabel: '🛡️ Bỏ Bài 100% Theo ICM',
        stanceColor: 'bg-emerald-950 text-emerald-300 border-emerald-600',
        quote: 'Call với AK ở đây là cú tự sát trị giá $8,000 tiền thật rớt thẳng vào túi đối thủ!',
        content: 'Đây là ví dụ kinh điển trong giáo trình MTT về "Sự Phá Hủy Của ICM" (ICM Suicide). Hãy nhìn vào tương quan bàn chơi: 6 đối thủ khác chỉ còn 5BB đến 11BB. Họ sẽ tự động bị loại trong 10-15 ván tới mà bạn không cần tốn một giọt mồ hôi! Khi SB 38BB đẩy vào bạn 45BB, dải bài của họ hẹp như sợi chỉ: QQ+, AKs. Tỷ lệ thắng của AKo chỉ là 39%. Thua ván này, bạn rớt xuống 7BB và vứt đi cơ hội ẵm $85,000. Hãy nuốt cái tôi lại và bấm FOLD nhẹ nhàng!',
        likes: 104,
        timeAgo: '1 ngày trước trên CardsChat'
      },
      {
        id: 'pro-cc-02',
        proName: 'TournamentCrusher',
        proRole: 'WSOP Circuit Ring Winner (6.800 bài)',
        proAvatarBg: 'bg-amber-600',
        forumSource: 'CardsChat',
        stance: 'exploit',
        stanceLabel: '🎯 Phân Tích Động Cơ Của Small Blind',
        stanceColor: 'bg-amber-950 text-amber-300 border-amber-600',
        quote: 'Small Blind đẩy 38BB vì họ biết thừa bạn chỉ dám Call với AA, họ đang tận dụng ICM để cướp 4.5BB chết của bạn!',
        content: 'Nhiều bạn thắc mắc: Tại sao SB lại liều lĩnh đẩy 38BB khi có 6 short stacks? Câu trả lời: Vì SB là cáo già! Họ hiểu rõ Button mở cược 2.0BB là đang cướp mù. SB đẩy 38BB vì biết chắc bạn buộc phải fold 95% dải bài mở cược. Bạn chỉ dám Call với đúng Đôi Át (AA). Họ cướp được 2BB cược + 1BB blind + 1.5BB ante ngọt ngào. Dù biết SB đang cướp, bạn VẪN PHẢI FOLD. Đó chính là sự tàn nhẫn của ICM!',
        likes: 78,
        timeAgo: '1 ngày trước trên CardsChat'
      },
      {
        id: 'pro-cc-03',
        proName: 'ICM_MathLab',
        proRole: 'ICMIZER & HRC Lab Analyst (4.100 bài)',
        proAvatarBg: 'bg-blue-600',
        forumSource: 'CardsChat',
        stance: 'gto',
        stanceLabel: '🧠 ICMIZER Chứng Minh Call Mất -$1,240 EV',
        stanceColor: 'bg-blue-950 text-blue-300 border-blue-600',
        quote: 'Chạy ICMIZER: Cú Call với AKo đem lại -$1,240 Dollar EV tổn thất thực tế!',
        content: 'Tôi vừa chạy giải pháp ICMIZER với cấu trúc bậc thang giải đấu này: Theo Chip EV đơn thuần thì AKo có thể hòa vốn, nhưng theo Dollar EV ($EV), Call AKo là âm -$1,240! Dải bài Call duy nhất mang lại dương EV (+ $4,120) ở tình huống này là Đôi Át [AA]. Ngay cả Đôi K [KK] cũng chỉ là điểm hòa vốn mong manh. Fold là nước đi khoa học duy nhất để bảo vệ tài khoản ngân hàng của bạn.',
        likes: 95,
        timeAgo: '18 giờ trước trên CardsChat'
      },
      {
        id: 'pro-cc-04',
        proName: 'AggroFish_Hero',
        proRole: 'CardsChat Active Member (2.350 bài)',
        proAvatarBg: 'bg-rose-600',
        forumSource: 'CardsChat',
        stance: 'shove',
        stanceLabel: '🔥 Phản Biện: Thích Tranh Chức Vô Địch',
        stanceColor: 'bg-rose-950 text-rose-300 border-rose-600',
        quote: 'Nếu cứ co cụm fold vì sợ rớt đài thì làm sao chạm tay vào chiếc cúp vô địch $85,000?',
        content: 'Tôi không đồng tình với việc Fold AK quá dễ dàng! Poker giải đấu là phải dũng cảm tranh chấp. Nếu bạn Call và thắng cú lật bài 38BB này, bạn sẽ vươn lên thành Siêu Chipleader với 83BB, áp đảo hoàn toàn cả bàn và nắm 70% cơ hội vô địch giải thưởng $85,000! Nếu bạn cứ kiên nhẫn chờ 6 người kia chết đói, bạn vào bàn chung kết với stack trung bình và sẽ bị Chipleader đè bẹp từng vòng.',
        likes: 45,
        timeAgo: '14 giờ trước trên CardsChat'
      },
      {
        id: 'pro-cc-05',
        proName: 'HighRoller_Strategist',
        proRole: 'CardsChat High Roller Pro (8.400 bài)',
        proAvatarBg: 'bg-emerald-600',
        forumSource: 'CardsChat',
        stance: 'fold',
        stanceLabel: '🛡️ Đáp Trả AggroFish: Bài Toán Tiền Thật',
        stanceColor: 'bg-emerald-950 text-emerald-300 border-emerald-600',
        quote: 'AggroFish đang nhầm lẫn giữa giải thưởng tiền thật (Dollar EV) và sự thỏa mãn cái tôi chiến thắng!',
        content: 'Trả lời AggroFish: Bạn quên mất rằng trong giải đấu có tiền thưởng bậc thang (Payjump). Từ hạng 10 lên hạng 4 bạn tự động bỏ túi thêm hơn $25,000 mà không cần mạo hiểm mạng sống chip! Nếu bạn Call AK và thua, bạn ra về với $4,200. Bạn vừa đánh rơi $25,000 tiền mặt chắc chắn chỉ để đổi lấy 40% cơ hội làm chipleader. Đó là tư duy cờ bạc may rủi chứ không phải tư duy đầu tư thể thao trí tuệ!',
        likes: 121,
        timeAgo: '10 giờ trước trên CardsChat'
      },
      {
        id: 'pro-cc-06',
        proName: 'Vietnam_MTT_Pro',
        proRole: 'VĐV Giải Đấu Việt Nam (4.200 bài)',
        proAvatarBg: 'bg-amber-600',
        forumSource: 'CardsChat',
        stance: 'exploit',
        stanceLabel: '🎯 Thực Chiến Giải Đấu Offline Châu Á',
        stanceColor: 'bg-amber-950 text-amber-300 border-amber-600',
        quote: 'Tại các giải đấu trực tiếp, nhiều người chơi không biết tính ICM và đẩy bài rất hoang dã!',
        content: 'Thực tế tại các giải APT hoặc giải địa phương: Hãy quan sát thật kỹ đối thủ ở Small Blind! Nếu họ là người chơi chuyên nghiệp, họ đẩy All-in vì biết bạn sẽ Fold. Nhưng nếu đối thủ là một "đại gia" hoặc người chơi thích thể hiện không quan tâm tiền thưởng bậc thang, dải bài đẩy của họ có thể rộng tới 88, 99, TT, AJs, KQ. Tuy nhiên, dù dải bài đối thủ có rộng hơn đôi chút, thì AKo vẫn là cú Call rủi ro cực cao. Phương án tối ưu chuẩn CLB vẫn là bảo toàn mạng sống!',
        likes: 87,
        timeAgo: '6 giờ trước trên CardsChat'
      }
    ],
    comments: [
      {
        id: 'bl-cc-01',
        author: 'MTT_MasterSG',
        authorBadge: 'Cao Thủ Chiến Thuật',
        authorRole: 'Cao Thủ Chiến Thuật',
        avatarBg: 'bg-emerald-600',
        time: '1 ngày trước',
        content: 'Bài viết rất hay từ CardsChat! Trước đây mình toàn tiếc bài AK mà call ẩu rồi ôm hận.',
        likes: 31
      }
    ]
  },
  {
    id: 'bai-viet-04',
    mainSection: 'tong-hop-dien-dan',
    mainSectionName: '1. Trạm Tình Báo Quốc Tế',
    category: 'cash-online',
    categoryName: 'Bàn Đánh Tiền Mặt (Cash Games)',
    subForum: 'Hand Analysis Bàn Cược Vừa',
    originalSource: 'CardsChat Forum (cardschat.com - Hand Discussions 2025/2026)',
    title: 'Cầm Đôi Bồi (JJ) ở vị trí Mù Nhỏ gặp 3-Bet từ Button: Nên 4-Bet All-in, Call hay Fold?',
    author: 'BienTapVien_CLB',
    authorRole: 'Biên tập',
    authorPosts: 295,
    authorJoinDate: '14/02/2021',
    publishedAt: '2 ngày trước',
    gameType: 'Poker Trực Tuyến - Bàn 6-max NL100',
    stakes: 'Mức cược: $0.50 / $1.00 ($100 Buy-in)',
    formatTags: ['online', 'cash'],
    views: 3180,
    replies: 52,
    likes: 184,
    summary: 'Phân tích chuyên sâu: Đôi Bồi (Pocket Jacks) là bài gây đau đầu nhất cho người chơi. Cách xử lý tối ưu khi bạn bị ép phải chơi ngoài vị trí (Out of Position) sau Flop.',
    detailedAnalysis: `1. Tại sao Đôi Bồi (JJ) khó chơi:
- Trên mặt bài Flop, có tới hơn 57% khả năng sẽ xuất hiện ít nhất một lá Át, K hoặc Q, biến đôi Bồi của bạn thành Đôi thứ hai (Underpair).
- Khi bạn ngồi ở Mù nhỏ (SB) và chỉ chọn Theo cược (Call 3-bet), bạn sẽ phải chơi cả 3 vòng Flop, Turn, River mà không có lợi thế vị trí, rất dễ bị đối thủ cược dồn ép lừa dối.

2. Giải pháp chiến thuật hiện đại:
- Thay vì thụ động Call, phương án tối ưu trong dải bài GTO là thực hiện Tố thêm lần 4 (4-Bet) nhỏ lên khoảng 2.3x - 2.5x cú cược của Button (ví dụ: Button 3-bet $9, SB 4-bet lên $22).
- Cú 4-bet này buộc đối thủ phải bỏ ngay các bài bluff nhẹ (A5s, K9s, QTs) và trao lại thế chủ động cho bạn.`,
    gtoRecommendations: `• Quy tắc xử lý Đôi Bồi ở SB:
- 4-Bet lên 2.4x: 70% tần suất.
- Bỏ bài (Fold) nếu đối thủ 5-Bet All-in (trừ khi đối thủ là người chơi cực kỳ cuồng loạn).
- Hạn chế tối đa việc Flat Call 3-bet ở vị trí Mù nhỏ với JJ.`,
    keyTakeaways: [
      'Đôi Bồi cần sự chủ động tấn công mạnh mẽ preflop hơn là lối chơi phòng thủ chờ đợi.',
      'Chơi ngoài vị trí với dải bài trung bình mạnh luôn là cái bẫy đốt chip nếu không có kế hoạch rõ ràng.'
    ],
    comments: [
      {
        id: 'bl-cc-02',
        author: 'HocVien_SaiGon',
        authorBadge: 'Học viên',
        authorRole: 'Học viên',
        avatarBg: 'bg-blue-600',
        time: '1 ngày trước',
        content: 'Đọc xong bài này sáng mắt ra luôn! Cứ cầm JJ là em lúng túng không biết nên làm gì.',
        likes: 27
      }
    ]
  },
  {
    id: 'bai-viet-05',
    mainSection: 'tong-hop-dien-dan',
    mainSectionName: '1. Trạm Tình Báo Quốc Tế',
    category: 'toan-hoc',
    categoryName: 'Toán Học & Lý Thuyết GTO',
    subForum: 'Lý Thuyết Hình Học Cược Bài',
    originalSource: 'PokerStrategy Forum (pokerstrategy.com - 2025/2026)',
    title: 'Tại sao kích thước Cược vượt hũ (Overbet 125% - 150%) trên mặt bài Át cao là chuẩn mực mới?',
    author: 'ChienLuoc_Solver',
    authorRole: 'Giảng viên',
    authorPosts: 620,
    authorJoinDate: '05/01/2018',
    publishedAt: '3 ngày trước',
    gameType: 'Lý thuyết chiến thuật giải bài Solver',
    stakes: 'Áp dụng cho mọi cấp độ bàn chơi',
    formatTags: ['online', 'cash'],
    views: 4520,
    replies: 79,
    likes: 340,
    summary: 'Bài phân tích chuyên sâu: Tại sao các cao thủ thế giới từ bỏ thói quen cũ cược 1/3 hũ, chuyển sang cược cực lớn (Overbet) khi mặt bài xuất hiện lá Át.',
    detailedAnalysis: `[1. Ngoại cảnh & Tương quan bàn chơi: Giai đoạn giải, độ sâu Stack, vị trí, tâm lý đối thủ]
- Thể loại: Bàn tiền mặt hoặc giải đấu sâu chip (Deepstack 100BB+).
- Tương quan vị trí: Người mở cược ở vị trí Button hoặc Cutoff đối đầu với người phòng thủ ở Mù lớn (Big Blind).
- Tâm lý đối thủ: Người chơi phòng thủ Big Blind thường có tâm lý "giá rẻ nên call xem Flop", do đó khoảng bài của họ chứa rất nhiều bài rác, đôi nhỏ, bài nối không cùng chất. Họ không bao giờ có đôi siêu cấp (AA, KK) hay AK mạnh vì nếu có đã 3-bet trước đó (khoảng bài bị giới hạn trần - Capped Range).

[2. Diễn biến hành động các vòng: Preflop, Flop, Turn, River]
• Preflop: Button mở cược 2.5BB. Big Blind theo cược (Call). Hũ tiền: 5.5BB.
• Flop: Lật ra mặt bài Át khô ráo [Át cơ, 8 bích, 3 rô]. Big Blind Check. Button cược tiếp nối nhỏ 1/3 hũ (2BB). Big Blind Call. Hũ tiền: 9.5BB.
• Turn: Lá [2 chuồn]. Big Blind tiếp tục Check. Lúc này, thay vì cược 60-70% hũ như sách cũ, Button tung ra cú Cược vượt hũ (Overbet 130% hũ = 12.5BB)!
• River: Lá [K tép]. Big Blind Check vòng thứ 3. Button đẩy thêm một cú Overbet All-in 150% hũ, đưa đối thủ vào bài toán cân não sinh tử.

[3. Góc nhìn từ cộng đồng quốc tế]
- Chuyên mục No Limit Hold'em Strategy của PokerStrategy:
  + Trường phái cổ điển: Phản đối cược vượt hũ, cho rằng cược quá lớn sẽ đuổi hết đối thủ chỉ còn lại bài mạnh hơn mới dám Call.
  + Trường phái Solver & Khoa học hiện đại: Khẳng định Overbet là vũ khí tối tân nhất trong Poker hiện đại. Khi bạn nắm giữ "Lợi thế bài mạnh tuyệt đối" (Nut Advantage: gồm toàn bộ AA, AK, A8, set 8, set 3), còn đối thủ bị trần bài ở A-x yếu, việc Overbet ép đối thủ phải trả giá đắt nhất cho từng lá bài họ muốn xem, đồng thời cho phép bạn mang theo một lượng bài Bluff cân bằng rất lớn mà đối thủ không thể bắt bài.

[4. Đúc kết thực chiến chuẩn CLB để kiếm ăn ổn định]
- Bài học số 1: "Chỉ Overbet khi đối thủ bị giới hạn trần sức mạnh bài (Capped Range)". Đừng bao giờ Overbet khi đối phương vẫn có thể giữ bài Nuts.
- Bài học số 2: Phân nhóm bài khi Overbet: 60% bài ăn tiền cực mạnh (Value) kết hợp với 40% bài mua ngầm cửa sau (Backdoor draws) để cân bằng.
- Thực chiến kiếm ăn: Tại các bàn chơi ở Việt Nam, người chơi rất thích "rình rập và call lì lợm". Một cú Overbet với Top Pair Kicker mạnh hoặc Bộ ba sẽ vắt kiệt từng đồng chip của họ mà những cú cược nhỏ 1/3 hay 1/2 hũ không bao giờ làm được!`,
    gtoRecommendations: `• Phân nhóm bài khi cược vượt hũ:
- Nhóm ăn tiền cực mạnh: Cầm Át-K, Hai đôi, Xám cô.
- Nhóm cược lừa dối cân bằng: Các lá bài có cửa mua sảnh và mua thùng ngầm cửa sau (Backdoor Draws).`,
    keyTakeaways: [
      'Chỉ cược vượt hũ khi bạn nắm giữ lợi thế bài mạnh tuyệt đối.',
      'Kích thước cược lớn buộc đối phương phải đưa ra quyết định khó khăn và phạm sai lầm nhiều nhất.'
    ],
    proInteractions: [
      {
        id: 'pro-ps-01',
        proName: 'PS_DiamondCoach',
        proRole: 'PokerStrategy Diamond Coach (18.500 bài)',
        proAvatarBg: 'bg-rose-700',
        forumSource: 'PokerStrategy',
        stance: 'shove',
        stanceLabel: '🔥 Overbet Hình Học Vắt Kiệt Đối Thủ',
        stanceColor: 'bg-rose-950 text-rose-300 border-rose-600',
        quote: 'Cược 1/3 hũ trên mặt Át ở Turn là thói quen lỗi thời của năm 2018, Overbet mới là cỗ máy in tiền!',
        content: 'Nhiều học viên trên diễn đàn PokerStrategy vẫn giữ thói quen cược nhỏ ở Turn. Nhưng hãy nhìn vào tương quan dải bài: Sau khi Big Blind call Flop [A-8-3], khoảng bài của họ bị "trần" (Capped) ở A-x yếu (A5, A7, A9, ATo) hoặc đôi 8. Họ không thể có AA, KK, AK vì đã 3-bet preflop. Trong khi đó, người mở cược Button nắm giữ toàn bộ Nut Advantage (AA, AK, A8s, 88). Khi bạn tung cú Overbet 130% ở Turn và 150% ở River, bạn đặt đối thủ vào thế cực kỳ khó chịu: họ phải trả giá đắt nhất nếu muốn giữ đôi Át yếu của mình, và bạn có thể mang theo 40% Bluff mà đối thủ không thể nào bắt bài nổi!',
        likes: 126,
        timeAgo: '3 ngày trước trên PokerStrategy'
      },
      {
        id: 'pro-ps-02',
        proName: 'MicroStakesHero',
        proRole: 'NL50 Grinder (5.120 bài)',
        proAvatarBg: 'bg-amber-600',
        forumSource: 'PokerStrategy',
        stance: 'exploit',
        stanceLabel: '🎯 Áp Dụng Thực Chiến Bàn Cược Nhỏ',
        stanceColor: 'bg-amber-950 text-amber-300 border-amber-600',
        quote: 'Ở bàn cược nhỏ, chỉ dùng Overbet cho bài Cực Mạnh (Value), bỏ bớt Bluff vì người ta rất ngại fold Át!',
        content: 'Một lưu ý cực kỳ quan trọng cho anh em cày micro stakes: Ở NL20 - NL50, đối thủ bấm Call Flop với A-2 hay A-4 thì Turn và River họ rất khó Fold! Nếu bạn Overbet bluff ở các bàn này, bạn sẽ bị họ "Call lãng nhách" rồi ôm hận. Bí kíp của tôi: Tại các bàn cược thấp, hãy dùng Overbet 130% CHỈ VỚI VALUE (AK, 2 đôi, Set), bỏ hẳn phần bluff! Đối thủ vẫn sẽ call vì họ nghĩ bạn đang cố cướp hũ, và bạn ăn trọn hũ tiền khổng lồ.',
        likes: 88,
        timeAgo: '2 ngày trước trên PokerStrategy'
      },
      {
        id: 'pro-ps-03',
        proName: 'GTO_Simplifier',
        proRole: 'Modern Theory Master (7.600 bài)',
        proAvatarBg: 'bg-blue-600',
        forumSource: 'PokerStrategy',
        stance: 'gto',
        stanceLabel: '🧠 Tỷ Lệ Cân Bằng 60% Value / 40% Bluff',
        stanceColor: 'bg-blue-950 text-blue-300 border-blue-600',
        quote: 'Kích thước cược càng lớn thì tỷ lệ bài Bluff cho phép càng cao mà không thể bị trừng phạt!',
        content: 'Toán học đằng sau Overbet: Khi bạn cược 150% pot, đối thủ cần tỷ lệ Pot Odds là 1.5 / (1 + 1.5 + 1.5) = 37.5%. Điều đó có nghĩa là dải bài Overbet của bạn có thể chứa tới gần 40% các bài Bluff mà đối thủ dù có biết cũng hoàn toàn bất lực không thể khai thác! Những lá bài bluff hoàn hảo nhất ở đây là các lá bài có cửa mua ngầm cửa sau (Backdoor Flush Draw hoặc Straight Draw trượt). Đó chính là vẻ đẹp tuyệt mỹ của lý thuyết trò chơi hiện đại.',
        likes: 110,
        timeAgo: '2 ngày trước trên PokerStrategy'
      },
      {
        id: 'pro-ps-04',
        proName: 'OldSchool_TAG',
        proRole: 'PokerStrategy Veteran 2012 (11.200 bài)',
        proAvatarBg: 'bg-purple-600',
        forumSource: 'PokerStrategy',
        stance: 'call',
        stanceLabel: '🛡️ Phe Cổ Điển Hoài Nghi Cược Quá Lớn',
        stanceColor: 'bg-purple-950 text-purple-300 border-purple-600',
        quote: 'Cược 150% pot chẳng phải chỉ giữ lại mỗi bài xám cô hoặc hai đôi của đối thủ hay sao?',
        content: 'Theo trường phái TAG cổ điển: Mục tiêu của Value Bet là làm sao để bài yếu hơn của đối thủ có thể Call được. Khi bạn cược 150% hũ, bạn đang tự phân cực dải bài quá mức. Đối thủ chỉ Call khi họ có bài cực mạnh đánh bại bạn (Set 88, 33 hoặc 2 đôi), và họ sẽ Fold sạch các bài Ax yếu. Vậy cú Overbet này có thực sự ăn được nhiều tiền hơn 2 cú cược 50% pot ở cả Turn và River hay không?',
        likes: 52,
        timeAgo: '1 ngày trước trên PokerStrategy'
      },
      {
        id: 'pro-ps-05',
        proName: 'PioSolver_Devotee',
        proRole: 'Solver Lab Senior Researcher (9.150 bài)',
        proAvatarBg: 'bg-cyan-600',
        forumSource: 'PokerStrategy',
        stance: 'gto',
        stanceLabel: '🧠 Giải Đáp Hoài Nghi Bằng Khái Niệm MDF',
        stanceColor: 'bg-cyan-950 text-cyan-300 border-cyan-600',
        quote: 'Theo Tần Suất Phòng Thủ Tối Thiểu (MDF), đối thủ không thể Fold hết đôi Át yếu được!',
        content: 'Trả lời OldSchool_TAG: Bạn đang đánh giá thấp toán học! Đối mặt với cú cược 130% pot, Big Blind buộc phải phòng thủ tối thiểu 43% dải bài (MDF = 1 / (1 + 1.3)). Nếu Big Blind fold toàn bộ Ax yếu (A9, AT, AJ) và chỉ call Set, tần suất fold của họ sẽ lên tới 75%! Khi đó, người cược Button chỉ cần cầm 2 lá rác bất kỳ cược Overbet là đã tự động in ra tiền lời khổng lồ (+EV tự động). Do đó, đối thủ có trình độ BUỘC PHẢI CALL với một tỷ lệ đôi Át yếu nhất định, và đó là lúc bài ăn tiền mạnh (AK, Set) của bạn hốt trọn tài sản của họ!',
        likes: 142,
        timeAgo: '18 giờ trước trên PokerStrategy'
      },
      {
        id: 'pro-ps-06',
        proName: 'Bankroll_Guardian',
        proRole: 'Chuyên Gia Quản Trị Rủi Ro Vốn (7.400 bài)',
        proAvatarBg: 'bg-amber-600',
        forumSource: 'PokerStrategy',
        stance: 'exploit',
        stanceLabel: '🎯 Quản Lý Vốn Khi Chơi Lối Đánh Overbet',
        stanceColor: 'bg-amber-950 text-amber-300 border-amber-600',
        quote: 'Lối chơi Overbet đem lại winrate cao ngất ngưởng nhưng biến động (Variance) cực lớn!',
        content: 'Một lưu ý cốt tử từ kinh nghiệm thực chiến: Khi bạn đưa kích thước cược 130% - 150% vào kho vũ khí của mình, quy mô các hũ tiền bạn tham gia sẽ phình to gấp 3 lần bình thường. Các cú swing thắng thua sẽ rất dữ dội. Để chịu được phương sai này mà không bị phá sản hoặc tilt tâm lý, bạn cần nâng mức đệm vốn an toàn từ 50 buy-in lên tối thiểu 70 - 100 buy-in cho mức cược bạn đang chơi!',
        likes: 99,
        timeAgo: '8 giờ trước trên PokerStrategy'
      }
    ],
    comments: [
      {
        id: 'bl-ps-01',
        author: 'Quang_ProGrinder',
        authorBadge: 'Cao Thủ Chiến Thuật',
        authorRole: 'Cao Thủ Chiến Thuật',
        avatarBg: 'bg-purple-600',
        time: '2 ngày trước',
        content: 'Bài viết kinh điển của PokerStrategy! Đọc lại vẫn thấy quá nhiều kiến thức giá trị.',
        likes: 35
      }
    ]
  },
  {
    id: 'bai-viet-06',
    mainSection: 'trao-doi-chinh',
    mainSectionName: '2. Phân tích sâu vấn đề',
    category: 'tam-ly',
    categoryName: 'Tâm Lý & Quản Lý Tiền Vốn',
    subForum: 'Kiểm soát Tilt & Bankroll Challenge',
    originalSource: 'PokerStrategy Forum (pokerstrategy.com - Blogs & Challenges 2025/2026)',
    title: 'Chiến lược vượt qua chuỗi thua (Downswing 30 buy-ins) khi cày bàn nhanh: Quy tắc vốn 50-70 buy-ins',
    author: 'QuanTri_Bankroll',
    authorRole: 'Biên tập',
    authorPosts: 410,
    authorJoinDate: '22/09/2019',
    publishedAt: '4 ngày trước',
    gameType: 'Quản lý tiền vốn và tâm lý chơi bàn nhanh',
    stakes: 'Áp dụng cho mọi cấp độ bàn Cash và MTT',
    views: 3980,
    replies: 62,
    likes: 295,
    summary: 'Chia sẻ kinh nghiệm quản lý vốn và tâm lý: Làm sao để phân biệt giữa việc kém may mắn do xác suất ngẫu nhiên và việc cay cú mất bình tĩnh (Tilt) làm bốc hơi toàn bộ tài khoản.',
    detailedAnalysis: `1. Phân biệt may rủi xác suất và sự cay cú tiềm thức:
- Khi chơi trực tuyến tốc độ cao (1.000 ván mỗi giờ), việc bạn gặp chuỗi thua mất 30 lần tiền mua bàn trong 60.000 ván là điều hoàn toàn bình thường về mặt toán học xác suất.
- Tuy nhiên, nguy hiểm nhất là "Sự cay cú thầm lặng": Cố theo cược ở vòng cuối với ý nghĩ "Nó lại lừa dối mình đấy", không dám cược chủ động vì sợ bị đối phương đè bài.

2. Quy tắc quản lý vốn thép:
- Luôn duy trì tối thiểu 50 đến 70 lần tiền mua bàn (Buy-ins) cho mức cược hiện tại.
- Nếu tài khoản sụt giảm xuống dưới 30 lần tiền mua bàn, BẮT BUỘC phải hạ xuống bàn chơi mức cược nhỏ hơn ngay lập tức để bảo toàn vốn.`,
    gtoRecommendations: `• Ba bước kỷ luật sắt:
1. Đặt điểm cắt lỗ hàng ngày: Thua 3-4 buy-ins trong ngày là lập tức tắt máy tính đi nghỉ ngơi.
2. Giảm bớt số lượng bàn chơi cùng lúc để duy trì sự tập trung tối đa.
3. Luôn coi Poker là cuộc đua marathon dài hạn, không để kết quả một vài ván bài làm lung lay tinh thần.`,
    keyTakeaways: [
      'Biến động xác suất (Variance) là điều tất yếu không thể tránh khỏi trong Poker.',
      'Biết hạ mức cược khi cần thiết là phẩm chất của một vận động viên Poker chuyên nghiệp.'
    ],
    comments: [
      {
        id: 'bl-ps-02',
        author: 'KiemChe_LaThang',
        authorBadge: 'Học viên VIP',
        authorRole: 'Học viên',
        avatarBg: 'bg-blue-600',
        time: '3 ngày trước',
        content: 'Bài học đắt giá nhất sự nghiệp chơi Poker của em! Tuân thủ bài này giúp tài khoản em tăng trưởng bền vững.',
        likes: 54
      }
    ]
  },
  {
    id: 'bai-viet-07',
    mainSection: 'tong-hop-dien-dan',
    mainSectionName: '1. Trạm Tình Báo Quốc Tế',
    category: 'cash-online',
    categoryName: 'Bàn Đánh Tiền Mặt (Cash Games)',
    subForum: 'Bàn Tiền Mặt Trực Tiếp (Live Cash)',
    originalSource: 'TwoPlusTwo Forum (forumserver.twoplustwo.com - Live Poker)',
    title: 'Bàn tiền mặt trực tiếp (Live Cash $2/$5): Xử lý thế nào khi đối thủ liên tục Straddle và Buy-in sâu 200BB?',
    author: 'Vegas_LiveGrinder',
    authorRole: 'Cao Thủ Chiến Thuật',
    authorPosts: 940,
    authorJoinDate: '15/05/2018',
    publishedAt: 'Mới đăng hôm nay (Cập nhật 2026)',
    gameType: 'Poker Trực Tiếp - Bàn Live Cash $2/$5 Deepstack',
    stakes: 'Mức cược: $2 / $5 (Straddle $10, Độ sâu 200BB - $1.000+)',
    formatTags: ['live', 'cash'],
    views: 3120,
    replies: 45,
    likes: 198,
    summary: 'Chủ đề thảo luận bàn Live Cash: Khi bàn đánh trực tiếp có đối thủ liên tục kích hoạt Straddle $10 biến game thành $2/$5/$10 và mọi người đều mua vào sâu 200BB, bạn nên thu hẹp hay mở rộng dải bài khởi đầu?',
    handHistory: `[Bàn chơi Live Cash $2/$5 tại Casino Bellagio / King's Resort]
- Cấu trúc: $2 / $5, người chơi UTG liên tục Straddle $10 mỗi vòng.
- Hero (Vị trí Cutoff): Cầm $1.200 (120 Straddle BB) với bài [K♠ Q♠].
- Villain 1 (Straddle UTG): "Action Player" chơi lỏng lẻo, thường xuyên Raise và Call mọi Flop, stack $1.500.
- Villain 2 (Button): Regular kỷ luật, stack $1.000.
- Preflop: UTG Straddle $10. Hai người chơi giữa Limp $10. Hero tại Cutoff tăng cược lên $45. Button Call $45. UTG Straddle Call $45. Hai người limp Fold. Pot: $155.
- Flop: [K♦ 9♣ 4♠]. UTG Check. Hero C-bet $60. Button Fold. UTG bất ngờ Check-raise lên $180!
- Câu hỏi thảo luận: Hero nên Call, 3-bet lên $420 hay Fold với Top Pair Kicker mạnh khi đối mặt cú Check-raise trên bàn Live?`,
    detailedAnalysis: '',
    gtoRecommendations: '',
    keyTakeaways: [],
    proInteractions: [
      {
        id: 'pro-2p2-live-01',
        proName: 'Bellagio_OldTimer',
        proRole: '2+2 Live Poker Legend (16.200 bài)',
        proAvatarBg: 'bg-emerald-700',
        forumSource: 'TwoPlusTwo',
        stance: 'call',
        stanceLabel: '🛡️ Theo Cược (Call) Kiểm Soát Pot',
        stanceColor: 'bg-emerald-950 text-emerald-300 border-emerald-600',
        quote: 'Trong bàn Live cược sâu, 3-bet Flop chỉ cô lập bản thân với bài mạnh hơn như Set 99 hoặc K9 hai đôi!',
        content: 'Spot này tôi khuyến nghị Call 100%! Tại sao không 3-bet? Vì nếu bạn 3-bet lên $420, bạn chỉ đuổi đi các bài semi-bluff hoặc đôi yếu của đối thủ và chỉ giữ lại những bài đè bạn (Set 99, 44, hoặc K9). Hãy Call $180 để giữ nguyên dải bài bluff của UTG ở Turn. Nếu lá Turn là lá bài an toàn (2, 3, 6, 7) và đối thủ cược tiếp, bạn có thể tái đánh giá kích thước cược của họ.',
        likes: 82,
        timeAgo: '3 giờ trước trên TwoPlusTwo'
      },
      {
        id: 'pro-2p2-live-02',
        proName: 'LiveExploit_King',
        proRole: 'Live High Stakes Pro (7.800 bài)',
        proAvatarBg: 'bg-amber-600',
        forumSource: 'TwoPlusTwo',
        stance: 'exploit',
        stanceLabel: '🎯 Khai Thác Bản Chất "Action Player"',
        stanceColor: 'bg-amber-950 text-amber-300 border-amber-600',
        quote: 'Đối thủ Straddle thích Check-raise Flop bằng rất nhiều bài trượt hoặc đôi nhỏ để thể hiện uy thế!',
        content: 'Những người chơi thích Straddle tại bàn Live có xu hướng đánh tâm lý cực nặng: Họ ghét bị người khác cướp straddle của mình, nên khi Flop ra K-cao khô ráo, họ hay Check-raise bằng các bài như K10, K8, hoặc thậm chí bài mua sảnh lọt khe (QJ, J10) để xem Hero có dám chơi lớn hay không. Do đó dải bài của họ rộng hơn sách giáo khoa rất nhiều. Call Flop và sẵn sàng bắt bài họ ở Turn là line ăn tiền nhiều nhất!',
        likes: 67,
        timeAgo: '2 giờ trước trên TwoPlusTwo'
      },
      {
        id: 'pro-2p2-live-03',
        proName: 'GTO_LiveSolver',
        proRole: 'Deepstack Live Theorist (4.300 bài)',
        proAvatarBg: 'bg-blue-600',
        forumSource: 'TwoPlusTwo',
        stance: 'gto',
        stanceLabel: '🧠 Phân Tích SPR Khi Có Straddle',
        stanceColor: 'bg-blue-950 text-blue-300 border-blue-600',
        quote: 'Straddle $10 biến độ sâu hiệu dụng từ 200BB xuống chỉ còn 100BB, làm thay đổi hoàn toàn chỉ số SPR!',
        content: 'Rất nhiều người chơi Live bị ảo giác bởi số tiền $1.200: Bình thường với blind $5 thì đó là 240BB, nhưng khi có Straddle $10 thì thực chất bàn chỉ còn 120BB hiệu dụng! Khi Pot Flop đã là $155 và đối thủ raise $180, Pot sau khi bạn call sẽ là $515 và tiền sau lưng còn lại khoảng $960 (SPR < 2). Ở chỉ số SPR này, Top Pair Kicker Q của bạn hoàn toàn đủ mạnh để đi tới cùng nếu đối thủ không overbet ở River.',
        likes: 91,
        timeAgo: '1 giờ trước trên TwoPlusTwo'
      }
    ],
    comments: [
      {
        id: 'bl-live-01',
        author: 'Dan_Bilmzerian_Slayer',
        authorBadge: 'Cao Thủ Chiến Thuật',
        authorRole: 'Cao Thủ Chiến Thuật',
        avatarBg: 'bg-indigo-600',
        time: '30 phút trước',
        content: 'Chuẩn xác! Bàn Live gặp Action player thì cứ Call giữ pot, đợi họ tự bắn vào chân ở Turn và River.',
        likes: 24
      }
    ]
  },
  {
    id: 'bai-viet-08',
    mainSection: 'tong-hop-dien-dan',
    mainSectionName: '1. Trạm Tình Báo Quốc Tế',
    category: 'giai-dau',
    categoryName: 'Giải Đấu Poker (Tournaments / MTT)',
    subForum: 'Giải Đấu Trực Tiếp (Live Tournaments)',
    originalSource: 'CardsChat Forum (cardschat.com - Live Events 2025/2026)',
    title: 'Giải đấu trực tiếp (Live MTT Mystery Bounty): Khi nào nên mạo hiểm Call All-in để săn phong bì tiền thưởng $50.000?',
    author: 'LiveBountyHunter',
    authorRole: 'Cao Thủ Chiến Thuật',
    authorPosts: 480,
    authorJoinDate: '20/09/2020',
    publishedAt: 'Hôm qua (Cập nhật 2026)',
    gameType: 'Giải đấu trực tiếp Live MTT Mystery Bounty',
    stakes: 'Buy-in $550 - Quỹ giải thưởng $500.000 (Top Bounty $50.000)',
    formatTags: ['live', 'tournament'],
    views: 3410,
    replies: 51,
    likes: 210,
    summary: 'Thể thức Mystery Bounty đang làm mưa làm gió tại các giải đấu trực tiếp thế giới. Làm sao để tính toán giá trị phong bì Bounty thành lượng chip tương đương (Bounty Equity) để đưa ra quyết định Call All-in tối ưu?',
    handHistory: `[Giải đấu Live Mystery Bounty $550 - Bắt đầu vòng mở phong bì]
- Tình trạng quỹ Bounty: Còn lại 42 người chơi, trong thùng còn nguyên chiếc phong bì độc đắc trị giá $50.000! Giá trị trung bình của mỗi phong bì hiện tại là $2.400 (gấp hơn 4 lần tiền mua giải ban đầu).
- Cấu trúc: Blinds 10.000 / 20.000, Ante 20.000.
- Hero (Vị trí Big Blind): Stack 650.000 chip.
- Villain (Short stack tại Cutoff): Đẩy cược tất tay All-in toàn bộ 140.000 chip (7BB).
- Small Blind fold. Hero nhìn bài tẩy cầm [K♠ 6♠].
- Câu hỏi thảo luận: Pot odds bình thường yêu cầu 36% tỷ lệ thắng để Call. Khi cộng thêm giá trị phong bì Bounty trung bình $2.400 (với cơ hội trúng $50.000), Hero có nên Call với K6 đồng chất hay không?`,
    detailedAnalysis: '',
    gtoRecommendations: '',
    keyTakeaways: [],
    proInteractions: [
      {
        id: 'pro-cc-bounty-01',
        proName: 'BountyMath_Wizard',
        proRole: 'CardsChat Math Analyst (8.900 bài)',
        proAvatarBg: 'bg-rose-600',
        forumSource: 'CardsChat',
        stance: 'call',
        stanceLabel: '🔥 Call Ngay Lập Tức Vì Bounty Equity Khổng Lồ',
        stanceColor: 'bg-rose-950 text-rose-300 border-rose-600',
        quote: 'Giá trị phong bì $2.400 quy đổi tương đương hơn 110.000 chip cộng thêm vào Pot, biến K6s thành cú Call siêu dương EV!',
        content: 'Đây là bài toán toán học thuần túy: Phong bì trung bình $2.400 quy đổi theo tỷ lệ chip/tiền thưởng của giải đấu này có giá trị tối thiểu 110.000 chip. Thay vì cần pot odds để ăn hũ 190.000 chip, thực tế Hero đang bỏ ra 120.000 chip để ăn hũ giá trị (190.000 + 110.000 = 300.000 chip)! Pot odds thực tế chỉ còn khoảng 28%. Bài K6s có tỷ lệ thắng trên 42% trước dải bài đẩy 7BB của Cutoff. Không Call ở đây là vứt tiền qua cửa sổ!',
        likes: 114,
        timeAgo: '1 ngày trước trên CardsChat'
      },
      {
        id: 'pro-cc-bounty-02',
        proName: 'Vegas_LiveCoach',
        proRole: 'WSOP Live Event Coach (11.500 bài)',
        proAvatarBg: 'bg-emerald-600',
        forumSource: 'CardsChat',
        stance: 'exploit',
        stanceLabel: '🎯 Phân Tích Cơ Hội Rút Thăm $50.000',
        stanceColor: 'bg-emerald-950 text-emerald-300 border-emerald-600',
        quote: 'Hero có 650.000 chip, mất 140.000 vẫn còn hơn 25BB để sinh tồn, hoàn toàn chấp nhận được rủi ro!',
        content: 'Yếu tố quan trọng nhất: Hero là người có stack phủ (Cover stack) đối thủ rất xa. Kể cả thua ván bài này, Hero vẫn còn 510.000 chip (hơn 25BB), vẫn sống khỏe và thi đấu bình thường. Nhưng nếu thắng, bạn nhận ngay một lượt bốc phong bì bí ẩn có cơ hội đổi đời $50.000 tiền tươi ngay lập tức. Đây là đặc quyền của người nhiều chip trong thể thức Mystery Bounty!',
        likes: 98,
        timeAgo: '18 giờ trước trên CardsChat'
      },
      {
        id: 'pro-cc-bounty-03',
        proName: 'Tournament_Conservative',
        proRole: 'CardsChat Veteran (5.400 bài)',
        proAvatarBg: 'bg-purple-600',
        forumSource: 'CardsChat',
        stance: 'fold',
        stanceLabel: '🛡️ Cảnh Báo "Hội Chứng Khát Bounty"',
        stanceColor: 'bg-purple-950 text-purple-300 border-purple-600',
        quote: 'Rất nhiều người chơi tự thiêu rụi stack của mình vì quá thèm khát bốc thăm trúng thưởng!',
        content: 'Mặc dù toán học ủng hộ Call, tôi muốn cảnh báo các bạn mới chơi Mystery Bounty: Đừng để lòng tham phong bì làm mờ mắt! Rất nhiều người chơi call bừa bãi với các bài rác như 94o, 73s chỉ vì muốn ăn bounty, để rồi sau 3 ván thua liên tiếp từ người nhiều chip trở thành kẻ sắp chết đói. Với K6s thì bài tương đối ổn, nhưng tuyệt đối không mở rộng dải bài xuống các bài rác không có cơ hội kết nối!',
        likes: 76,
        timeAgo: '12 giờ trước trên CardsChat'
      }
    ],
    comments: [
      {
        id: 'bl-bounty-01',
        author: 'Vietnam_MTT_Pro',
        authorBadge: 'Cao Thủ Chiến Thuật',
        authorRole: 'Cao Thủ Chiến Thuật',
        avatarBg: 'bg-amber-600',
        time: '6 giờ trước',
        content: 'Bài toán Bounty Equity quá chuẩn xác! Nhiều anh em đánh offline cứ sợ mất chip mà bỏ qua cơ hội bốc phong bì ngàn đô.',
        likes: 35
      }
    ]
  },
  {
    id: 'bai-viet-09',
    mainSection: 'tong-hop-dien-dan',
    mainSectionName: '1. Trạm Tình Báo Quốc Tế',
    category: 'giai-dau',
    categoryName: 'Giải Đấu Poker (Tournaments / MTT)',
    subForum: 'Phân Tích Bàn Chung Kết',
    originalSource: 'CardPlayer Magazine & Forum (cardplayer.com - Hand Analysis)',
    title: 'Bàn chung kết WPT $3.500: Cầm Đôi 10 (TT) với 28BB đối mặt cú 3-Bet All-in của Chip Leader khi trên bàn còn 2 nhà siêu Short-stack (6BB)',
    author: 'PhanTich_FinalTable',
    authorRole: 'Biên tập',
    authorPosts: 910,
    authorJoinDate: '14/02/2019',
    publishedAt: 'Mới cập nhật (2026)',
    gameType: 'Giải đấu trực tiếp Live MTT Final Table',
    stakes: 'Bàn chung kết 6 người - Bước nhảy giải thưởng (Payjump) $45.000',
    formatTags: ['live', 'tournament'],
    views: 3820,
    replies: 46,
    likes: 235,
    summary: 'Tình huống kinh điển tại bàn Final Table: Khi đang đứng thứ 2 về chip tại bàn chung kết, bạn có nên mạo hiểm Call All-in bằng Đôi 10 trước người dẫn đầu trong khi có 2 người chơi khác chỉ còn 5-6BB sắp bị loại?',
    handHistory: `[1. Ngoại cảnh & Tương quan vị trí/Stack trên bàn]
- Giải đấu: WPT Championship $3.500 Buy-in - Bàn chung kết (Final Table) còn lại 6 người chơi.
- Cơ cấu giải thưởng: Hạng 6 nhận $62.000, Hạng 5 nhận $85.000, Hạng 4 nhận $115.000, Vô địch nhận $480.000.
- Tương quan Stack (Blinds 50.000 / 100.000 - Ante 100.000):
  + UTG (Short stack 1): 550.000 chip (5.5BB)
  + MP (Short stack 2): 620.000 chip (6.2BB)
  + Hero (Cutoff - Đứng thứ 2 bàn): 2.800.000 chip (28BB) - Cầm [10♠ 10♥]
  + Villain (Button - Chip Leader đầu bàn): 6.500.000 chip (65BB) - Lối chơi LAG hiếu chiến, liên tục gây áp lực lên bàn.
  + SB & BB: Đều cầm khoảng 18BB.

[2. Diễn biến hành động các vòng]
• Preflop: UTG (5.5BB) và MP (6.2BB) lần lượt bỏ bài (Fold).
• Hero tại Cutoff cầm [10♠ 10♥] mở cược chuẩn 200.000 chip (2BB).
• Villain (Chip Leader 65BB) tại Button lập tức đẩy tất tay 3-Bet All-in gây áp lực tối đa lên toàn bộ 28BB của Hero.
• Hai nhà Mù (SB, BB) bỏ bài. Quyết định sinh tử thuộc về Hero: Call 26BB để đánh cược toàn bộ mạng sống giải đấu hay Bỏ bài (Fold) giữ lại 26BB chờ 2 nhà Short-stack rớt đài trước?`,
    detailedAnalysis: `[1. Ngoại cảnh & Tương quan vị trí/Stack trên bàn]
- Bối cảnh: Bàn chung kết 6 người giải đấu lớn. Áp lực tiền thưởng thực tế (ICM) đang ở mức cực đại vì có tới 2 người chơi chỉ còn 5.5BB và 6.2BB sắp đứt hơi.
- Vị trí & Stack: Hero đứng thứ 2 toàn bàn với 28BB, hoàn toàn nắm đằng chuôi để tiến sâu vào Top 3 nếu không tự sát với người dẫn đầu (Chip Leader 65BB).

[2. Diễn biến hành động các vòng]
- Sau khi 2 nhà ít chip bỏ bài, Hero mở cược 2BB với Đôi 10 (TT). Chip Leader tại Button tận dụng lợi thế nhiều chip nhất bàn đẩy thẳng All-in nhằm ép Hero phải bỏ bài hoặc tự đặt mạng sống vào thế 50/50.

[3. Luận điểm gốc từ diễn đàn quốc tế (CardPlayer)]
- Góc nhìn Chip-EV thông thường: Trong Cash Game hoặc đầu giải, Đôi 10 với 28BB trước cú 3-bet của Button là một cú Call không cần suy nghĩ.
- Góc nhìn ICM Bàn Chung Kết (Các chuyên gia CardPlayer): Hệ số rủi ro (Risk Premium) tại điểm này lên tới 64%! Nghĩa là Hero cần tối thiểu 64% tỷ lệ thắng mới hòa vốn về mặt tiền mặt thực tế ($EV), trong khi Đôi 10 đấu với dải bài đẩy của Chip Leader (A8s+, KQs, 77+, AJo+) chỉ có khoảng 54% tỷ lệ thắng.

[4. Kết luận & Bài học áp dụng theo hệ tư duy thực chiến của CLB]
- Bắt buộc BỎ BÀI (Discipline Fold): Giữ lại 26BB giúp Hero duy trì vị trí số 2 trên bàn, tiếp tục đè đầu 4 nhà còn lại và chắc chắn bỏ túi thêm hàng chục ngàn đô từ các bậc giải thưởng khi 2 nhà 5-6BB bị loại. Đấu súng 50/50 với Chip Leader lúc này là hành động tự sát về mặt tài chính!`,
    gtoRecommendations: 'Theo ICMizer / HRC Solver: Tại bàn Final Table có 2 nhà dưới 6BB, dải bài Call All-in 28BB của Hero trước Chip Leader thu hẹp chỉ còn đúng [QQ, KK, AA]. Cả JJ, TT và AK đều là Fold 100%!',
    keyTakeaways: [
      'Ở bàn chung kết, giá trị của số chip bạn mất đi luôn đắt giá gấp đôi số chip bạn thắng thêm được.',
      'Khi đang đứng nhì bàn và có các nhà sắp chết đói (5-6BB), tuyệt đối không đấu súng 50/50 với Chip Leader.'
    ],
    proInteractions: [
      {
        id: 'pro-cp-01',
        proName: 'Jonathan_Little_CP',
        proRole: 'CardPlayer Columnist & 2x WPT Champion',
        proAvatarBg: 'bg-amber-600',
        forumSource: 'CardPlayer',
        stance: 'fold',
        stanceLabel: '🛡️ Bỏ Bài Kỷ Luật (100% ICM Fold)',
        stanceColor: 'bg-emerald-950 text-emerald-300 border-emerald-600',
        quote: 'Đôi 10 chỉ có 54% equity trước dải bài của Chip Leader, nhưng ICM yêu cầu tới 64% để cú Call không bị âm tiền mặt!',
        content: 'Rất nhiều tay chơi nghiệp dư nhìn thấy Đôi 10 (TT) là hoa mắt bấm Call ngay vì nghĩ Chip Leader đang cậy nhiều tiền đi cướp. Đúng là anh ta đang ép bạn, nhưng theo toán học ICM trên bàn Final Table: Có 2 người chơi đang thoi thóp với 5.5BB và 6.2BB. Nếu bạn Call và thua, bạn rớt đài ở Hạng 6 ($62.000) trước cả hai người sắp chết kia! Nếu bạn Fold, bạn vẫn còn nguyên 26BB, đứng thứ 2 toàn bàn và thảnh thơi nhìn 2 nhà kia bị loại để lấy $85.000 - $115.000. Với Bubble Factor = 2.6, chỉ có QQ, KK, AA mới đủ điều kiện Call!',
        likes: 152,
        timeAgo: '8 giờ trước trên CardPlayer'
      },
      {
        id: 'pro-cp-02',
        proName: 'Steve_Zolotow_Vegas',
        proRole: 'CardPlayer Senior Strategist (2x WSOP Bracelet)',
        proAvatarBg: 'bg-blue-700',
        forumSource: 'CardPlayer',
        stance: 'exploit',
        stanceLabel: '🎯 Tư Duy Săn Giải Nhất vs Bảo Toàn Tiền Thưởng',
        stanceColor: 'bg-amber-950 text-amber-300 border-amber-600',
        quote: 'Sai lầm lớn nhất trước người dẫn đầu là mở cược rồi không chịu nổi nhiệt khi bị đẩy ngược!',
        content: 'Thực tế ở bàn Live, người cầm nhiều chip nhất luôn tận dụng quyền "bắt nạt" người đứng thứ 2 vì họ biết bạn không dám mạo hiểm bay màu. Ở vòng sau, nếu bạn cầm các bài trung bình ở gần Button của Chip Leader, hãy cân nhắc thu hẹp dải bài mở cược hoặc chuẩn bị sẵn tâm lý Fold nhẹ nhàng khi anh ta đẩy. Kỷ luật nhường một hũ nhỏ 2BB để bảo vệ vị thế 26BB là bản lĩnh của nhà vô địch.',
        likes: 94,
        timeAgo: '5 giờ trước trên CardPlayer'
      }
    ],
    comments: []
  },
  {
    id: 'bai-viet-10',
    mainSection: 'tong-hop-dien-dan',
    mainSectionName: '1. Trạm Tình Báo Quốc Tế',
    category: 'cash-online',
    categoryName: 'Bàn Đánh Tiền Mặt (Cash Games)',
    subForum: 'Thảo Luận Chuyên Sâu 3-Bet Pot',
    originalSource: 'Run It Once Forum (runitonce.com/forums - Elite Cash Game)',
    title: 'Bàn Cash 6-Max NL200: Xử lý thế nào trong 3-Bet Pot khi cầm [A♠ Q♥] ngoài vị trí trên mặt bài [K♦ J♠ 4♣] và bị đối thủ cược dồn vòng Turn?',
    author: 'CaoThu_CashGame',
    authorRole: 'Cao Thủ Chiến Thuật',
    authorPosts: 830,
    authorJoinDate: '19/07/2020',
    publishedAt: 'Mới cập nhật (2026)',
    gameType: 'Online Cash Game 6-Max NL200',
    stakes: 'Mức cược: $1 / $2 (Stack hiệu dụng 100BB - $200)',
    formatTags: ['online', 'cash'],
    views: 3190,
    replies: 39,
    likes: 188,
    summary: 'Phân tích chuyên sâu 3-Bet Pot: Khi bạn là người chủ động 3-Bet trước Flop nhưng mở ra mặt bài K-J-4 rơi đúng vào vùng bài mạnh của người theo cược có vị trí, làm sao để không đốt tiền oan?',
    handHistory: `[1. Ngoại cảnh & Tương quan vị trí/Stack trên bàn]
- Bàn chơi: Online Cash Game 6-Max NL200 ($1/$2).
- Stack hiệu dụng: 100BB ($200).
- Vị trí: Villain mở cược tại Cutoff (CO). Hero ngồi tại Mù Nhỏ (Small Blind - SB) cầm bài [A♠ Q♥].
- Hồ sơ đối thủ: Reg cày bàn NL200 có chỉ số vững chắc (VPIP 25 / PFR 21 / 3-Bet 10), hiểu rất rõ lợi thế vị trí trong 3-Bet Pot.

[2. Diễn biến hành động các vòng]
• Preflop: Cutoff mở cược $5 (2.5BB). Hero tại SB cầm [A♠ Q♥] tố thêm 3-Bet lên $20 (10BB). BB bỏ bài. Cutoff suy nghĩ rồi Call $20. (Hũ tiền: $42, Stack còn lại: $180, chỉ số SPR = 4.3).
• Flop: [K♦ J♠ 4♣] (Mặt bài cầu vồng, kết nối cao).
• Hành động Flop: Hero (SB) nhường lượt Check để bảo vệ dải bài. Villain (Cutoff) lập tức tận dụng vị trí cược $14 (1/3 Pot). Hero cầm AQo có đường mua sảnh lọt khe (Gutshot lá 10) và lá Át cao quyết định Call. (Hũ tiền: $70, Stack còn lại: $166).
• Turn: [7♥] (Lá bài trắng không thay đổi kết cấu).
• Hành động Turn: Hero Check. Villain cược dồn rất nặng $52 (75% Pot). Hero phải làm gì ở vòng Turn này?`,
    detailedAnalysis: `[1. Ngoại cảnh & Tương quan bàn chơi]
- Thể loại: Bàn 6-Max NL200 trực tuyến, 3-Bet Pot ngoài vị trí (SB đấu với CO).
- Độ sâu Stack: SPR ở Flop là 4.3, đủ sâu để đối thủ có vị trí triển khai chiến thuật gây sức ép nhiều vòng.

[2. Diễn biến hành động các vòng]
- Hero 3-Bet chuẩn với AQo tại SB. Flop ra K-J-4 cầu vồng — đây là mặt bài cực kỳ thuận lợi cho người Call có vị trí (vì Cutoff có đầy đủ KQs, KJs, QTs, JJ, 44). Hero Check-call nhẹ ở Flop 1/3 Pot nhờ có 4 lá 10 tạo sảnh tối cao (Nuts) và 3 lá Át. Tuy nhiên ở Turn rơi lá 7 cơ hoàn toàn vô hại, đối thủ tăng tốc cược lớn 75% Pot.

[3. Luận điểm gốc từ diễn đàn quốc tế (Run It Once)]
- Phân tích cấu trúc Range: Khi Cutoff đánh cược nhỏ ở Flop rồi đánh lớn 75% Pot ở lá Turn 7 trắng, dải bài của anh ta đã phân cực hoàn toàn sang nhóm bài cực mạnh (KJ, JJ, 44, AK, KQ) hoặc bài bán lừa dối có kèm cửa mua thùng/sảnh mạnh.
- Tại sao AQo không thể đi tiếp ở Turn: Chỉ có 4 lá 10 giúp Hero thắng chắc (khoảng 8% tỷ lệ ra bài ở River), trong khi các lá Át rơi xuống vẫn có thể khiến Hero thua ngược trước AK hoặc AJ/AT biến thành 2 đôi.

[4. Đúc kết thực chiến chuẩn CLB để kiếm ăn ổn định]
- BỎ BÀI DỨT KHOÁT Ở TURN (Fold Turn): Cú Check-call 1/3 Pot ở Flop với AQo là hoàn toàn chuẩn xác để không bị đối thủ cướp hũ rẻ. Nhưng khi Turn không ra lá 10 và đối thủ nã đạn lớn 75% Pot, nhiệm vụ của AQo đã kết thúc. Dân thực chiến giỏi là người biết dừng đúng lúc, tuyệt đối không "cố đấm ăn xôi" mua sảnh lọt khe (Gutshot) với giá cắt cổ ngoài vị trí!`,
    gtoRecommendations: 'PioSOLVER tại Run It Once: Ở Flop K-J-4r, SB Check-call AQo 100% trước cú bet 33% Pot. Nhưng sang Turn 7h trước cú bet 75% Pot, AQo bắt buộc Fold 100% (chỉ giữ lại AK, KQ, AA, KK, JJ và KJs để đi tiếp).',
    keyTakeaways: [
      'Mặt bài K-J-x trong 3-Bet Pot không phải lúc nào cũng thuộc về người 3-Bet; người Call có vị trí sở hữu rất nhiều bài 2 đôi và sảnh.',
      'Check-call 1 vòng ở Flop với bài mua sảnh lọt khe là đủ; nếu Turn trượt và bị cược lớn, hãy bỏ bài ngay lập tức.'
    ],
    proInteractions: [
      {
        id: 'pro-rio-01',
        proName: 'Galfond_Disciple',
        proRole: 'Run It Once Elite Coach (NL500+)',
        proAvatarBg: 'bg-indigo-600',
        forumSource: 'RunItOnce',
        stance: 'gto',
        stanceLabel: '🧠 Check-Call Flop Rồi Fold Turn Chuẩn GTO',
        stanceColor: 'bg-cyan-950 text-cyan-300 border-cyan-600',
        quote: 'Flop bạn đủ Pot Odds để theo với Gutshot + Overcard, nhưng ở Turn cú cược 75% Pot đã triệt tiêu hoàn toàn Implied Odds!',
        content: 'Các thành viên mới lên NL200 thường mắc 2 thái cực sai lầm với AQo ở đây: Hoặc là C-bet bừa ở Flop rồi bị Raise, hoặc là đã trót Call Flop thì tiếc tiền Call cố cả Turn. Hãy nhìn vào toán học trên Run It Once: Ở Flop, đối thủ cược $14 vào pot $42, bạn chỉ cần 20% equity là đủ Call (AQo có 24% equity). Nhưng ở Turn, đối thủ cược $52 vào pot $70 — bạn cần tới 30% equity trong khi chỉ còn đúng 1 vòng River với 4 con 10 (~8.7%). Bỏ bài ở Turn là quyết định kỷ luật duy nhất!',
        likes: 128,
        timeAgo: '6 giờ trước trên RunItOnce'
      },
      {
        id: 'pro-rio-02',
        proName: 'EuroGrinder_NL1K',
        proRole: 'RIO Pro Member (3.400 bài)',
        proAvatarBg: 'bg-emerald-600',
        forumSource: 'RunItOnce',
        stance: 'fold',
        stanceLabel: '🛡️ Cảnh Báo Bẫy Reverse Implied Odds Khi Ra Lá Át',
        stanceColor: 'bg-emerald-950 text-emerald-300 border-emerald-600',
        quote: 'Đừng đếm 3 lá Át là cửa thắng của bạn; khi ra Át ở River bạn rất dễ nộp hết cả stack cho AK hoặc KQ/QTs!',
        content: 'Một điểm mù chết người: Nhiều bạn nghĩ mình có 4 con 10 cộng thêm 3 con Át là 7 outs. Sai lầm! Khi Cutoff nã 75% Pot ở Turn, dải bài của anh ta có QTs (đã thành sảnh), KJ (2 đôi), JJ, 44. Nếu River rơi con Át, bạn có đôi Át nhưng vẫn thua toàn bộ các bài đó, thậm chí nếu đối thủ cầm QTs họ sẽ All-in lấy sạch $166 còn lại của bạn. Hãy vứt AQo ngay tại Turn!',
        likes: 95,
        timeAgo: '4 giờ trước trên RunItOnce'
      }
    ],
    comments: []
  },
  {
    id: 'bai-viet-11',
    mainSection: 'tong-hop-dien-dan',
    mainSectionName: '1. Trạm Tình Báo Quốc Tế',
    category: 'cash-online',
    categoryName: 'Bàn Đánh Tiền Mặt (Cash Games)',
    subForum: 'Chiến Thuật Cash Live Thực Tế',
    originalSource: 'CrushLivePoker Forum (crushlivepoker.com - Bart Hanson Live Cash)',
    title: 'Bàn Cash Live $2/$5 thực tế: Có 4 người chơi Limp vào hũ, bạn cầm [A♠ K♠] tại Button nên tăng cược (Iso-raise) bao nhiêu và xử lý sao khi 3 nhà cùng Call?',
    author: 'ChuyenGia_LiveCash',
    authorRole: 'Giảng viên',
    authorPosts: 1120,
    authorJoinDate: '08/11/2018',
    publishedAt: 'Mới cập nhật (2026)',
    gameType: 'Live Cash Game 9-Max ($2/$5)',
    stakes: 'Bàn tiền mặt trực tiếp $2 / $5 (Buy-in $1.000 - 200BB)',
    formatTags: ['live', 'cash'],
    views: 4510,
    replies: 63,
    likes: 290,
    summary: 'Bài học thực chiến sát sườn với các bàn chơi tại Việt Nam: Khi cả bàn thích Limp vào xem Flop rẻ, kích thước Iso-raise bao nhiêu là chuẩn và cách đánh Multi-way Pot (nhiều nhà) để lấy tối đa tiền từ người chơi giải trí.',
    handHistory: `[1. Ngoại cảnh & Tương quan vị trí/Stack trên bàn]
- Thể loại: Bàn Cash Game trực tiếp 9 người (Live Cash $2/$5), độ sâu Stack trung bình $1.000 (200BB).
- Đặc điểm bàn chơi: Bàn chơi điển hình ngoài đời thực — có tới 4 người chơi giải trí (Fish / Loose-Passive) rất thích Limp $5 để vào xem Flop cầu may, ghét bỏ bài trước Flop và cực kỳ dính bài nếu trúng Top Pair yếu.
- Vị trí: 4 người chơi ở đầu và giữa bàn lần lượt Limp $5. Hero ngồi tại Nút chia bài (Button) nhìn bài cầm [A♠ K♠].

[2. Diễn biến hành động các vòng]
• Preflop: Có 4 nhà Limp ($20) + 2 nhà Mù ($7) = $27 trong hũ.
• Hero tại Button cầm [A♠ K♠]: Nếu chỉ tăng cược chuẩn sách vở Online (3BB + 1BB mỗi nhà = $35), cả 4 nhà sẽ cùng Call tạo thành hũ 5 người cực kỳ hỗn loạn. Hero quyết định cô lập mạnh tay (Iso-raise) lên $45 (9BB).
• Bất ngờ: Dù tăng lên $45, vẫn có 2 người chơi giải trí ở giữa bàn bấm Call! (Hũ tiền Flop: $142, 3 người xem Flop).
• Flop: [K♣ 9♠ 5♠] (Hero có Đôi K cao nhất kèm đường mua Thùng bích tối cao - Top Pair Top Kicker + Nut Flush Draw).
• Hai người chơi trước nhường lượt Check. Hero nên cược bao nhiêu vào hũ $142 này?`,
    detailedAnalysis: `[1. Ngoại cảnh & Tương quan bàn chơi]
- Bàn Live Cash $2/$5 sâu 200BB với nhiều người chơi giải trí thụ động (thích Limp-call). Đây là bối cảnh giống tới 95% các bàn Cash thực tế tại Việt Nam.

[2. Diễn biến hành động các vòng]
- Trước 4 nhà Limp, Hero cầm AK đồng chất bích tại Button thực hiện cú Iso-raise lớn lên $45 (9BB) để trừng phạt dải bài yếu. Có 2 nhà theo cược tạo hũ $142. Flop ra K-9-5 có 2 lá bích, trao cho Hero siêu bài: Đôi K có Át kèm đường mua Thùng bích lớn nhất.

[3. Luận điểm gốc từ diễn đàn quốc tế (CrushLivePoker)]
- Quy tắc kích thước cược trên bàn Live (Bart Hanson): Trên bàn Live Cash, đừng bao giờ sợ cược lớn khi bạn có bài thật! Người chơi giải trí không quan tâm bạn cược 33% Pot hay 80% Pot — một khi họ cầm Kx (KJo, KTo, K8s) hoặc bài mua thùng/sảnh (QJs, JTs, 87s, XsYs), họ sẽ bấm Call bất chấp giá cả.
- Tránh bẫy C-bet nhỏ kiểu Online: Nếu bạn chỉ cược nhỏ $45 (1/3 Pot) theo thói quen Online, bạn đang tự tặng giá rẻ cho 2 đối thủ mua bài và bỏ lỡ cơ hội xây hũ lớn để ăn trọn $950 còn lại ở Turn và River.

[4. Đúc kết thực chiến chuẩn CLB để kiếm ăn ổn định]
- CƯỢC LỚN 75% - 85% POT NGAY TẠI FLOP ($110 - $120):
  1. Trước Flop trên bàn nhiều Limper: Công thức vàng là Mở cược = 4BB + 1.5BB cho mỗi nhà Limp (ở đây $45 - $50 là chuẩn xác).
  2. Sau Flop trong hũ nhiều người (Multi-way) khi cầm bài cực mạnh: Phải đánh lớn ngay từ Flop ($115 vào pot $142) để chuẩn bị đẩy hết tiền ở Turn. Dân chơi giải trí cầm KQ, KJ, KT hay mua thùng bích nhỏ hơn sẽ vui vẻ nộp toàn bộ tiền cho bạn!`,
    gtoRecommendations: 'Khai thác thực chiến (Exploitative Live Play): Trong Multi-way Pot trước người chơi Loose-Passive, hãy dẹp bỏ kích thước cược nhỏ 25-33% Pot khi cầm Value Hand mạnh. Cược 80% Pot ở Flop và tiếp tục nã lớn ở mọi lá Turn để lấy tối đa Value!',
    keyTakeaways: [
      'Trên bàn Live nhiều người Limp, hãy tăng kích thước Iso-raise lên 8BB-10BB để cô lập đối thủ và làm phình hũ với bài mạnh.',
      'Khi người chơi giải trí đã trúng Đôi K yếu hoặc mua thùng nhỏ, họ không nhạy cảm với kích thước cược — hãy cược thật dày để thu tối đa lợi nhuận.'
    ],
    proInteractions: [
      {
        id: 'pro-clp-01',
        proName: 'Bart_Hanson_CLP',
        proRole: 'Founder CrushLivePoker & Live Cash Legend',
        proAvatarBg: 'bg-emerald-600',
        forumSource: 'CrushLivePoker',
        stance: 'exploit',
        stanceLabel: '🎯 Cược Lớn $115 Ngay Tại Flop Để Xây Hũ',
        stanceColor: 'bg-amber-950 text-amber-300 border-amber-600',
        quote: 'Ở bàn Live $2/$5, người chơi cầm KJ hay mua thùng Q-bích không bao giờ Fold ở Flop dù bạn cược $50 hay $120!',
        content: 'Lỗi đốt tiền lớn nhất của dân đánh Online khi bước ra bàn Live là mang nguyên cái size cược 1/3 Pot ($45) vào cái hũ 3 người này! Bạn đang cầm [As Ks] trên mặt [Kc 9s 5s] — bạn vừa có Top Pair Top Kicker vừa chặn hoàn toàn Nut Flush, tức là ngay cả khi đối thủ có Set 99 hay 55 thì bạn vẫn còn tới 9 lá bích để lật ngược thế cờ. Quan trọng hơn: Hai gã Limp-call $45 kia đang cầm gì? Họ đang cầm KQ, KJ, KT, QsJs, JTs, 98s. Họ sẽ Call $115 dễ dàng hệt như Call $45! Hãy cược $115 ngay lập tức để biến hũ Turn thành $370 và lấy trọn cả stack $1.000 của họ!',
        likes: 176,
        timeAgo: '5 giờ trước trên CrushLivePoker'
      },
      {
        id: 'pro-clp-02',
        proName: 'Texas_Deepstack_Pro',
        proRole: 'CrushLivePoker Senior Coach',
        proAvatarBg: 'bg-rose-700',
        forumSource: 'CrushLivePoker',
        stance: 'shove',
        stanceLabel: '🔥 Sẵn Sàng Đẩy Trọn Stack Ở Turn Bất Kể Lá Gì',
        stanceColor: 'bg-rose-950 text-rose-300 border-rose-600',
        quote: 'Với Top Pair + Nut Flush Draw, bạn có quyền gây áp lực tối đa lên mọi lá bài Turn!',
        content: 'Điểm tuyệt vời của việc cược lớn $115 ở Flop là khi 1 trong 2 nhà Call, hũ tiền ở Turn đã lên tới $372 trong khi stack còn lại khoảng $840. Bất kể lá Turn rơi ra lá bích (bạn thành Thùng tối cao) hay lá trắng (bạn vẫn là Top Pair mạnh nhất kèm 9 outs thùng), bạn đều có thể nã tiếp một viên đạn $275 hoặc All-in để vắt kiệt từng đồng từ các bài Kx và Flush Draw nhỏ hơn của đối thủ!',
        likes: 112,
        timeAgo: '3 giờ trước trên CrushLivePoker'
      }
    ],
    comments: []
  },
  {
    id: 'bai-viet-12',
    mainSection: 'tong-hop-dien-dan',
    mainSectionName: '1. Trạm Tình Báo Quốc Tế',
    category: 'toan-hoc',
    categoryName: 'Toán Học Poker & Công Cụ GTO',
    subForum: 'Phân Tích Lý Thuyết Cược Bài',
    originalSource: 'Reddit r/Poker_Theory (reddit.com/r/Poker_Theory - GTO & Exploit)',
    title: 'Tại sao khi lá bài thứ 3 đồng chất rơi ở vòng Turn (Hoàn thành Thùng), vũ khí tối ưu nhất lại là Cược Nhỏ 25%-33% Pot thay vì Cược Lớn?',
    author: 'ToanHoc_GTO',
    authorRole: 'Cao Thủ Chiến Thuật',
    authorPosts: 520,
    authorJoinDate: '22/05/2021',
    publishedAt: 'Mới cập nhật (2026)',
    gameType: 'Chiến thuật Cash Game & MTT hiện đại',
    stakes: 'Ứng dụng trên mọi cấp độ bàn chơi (NL50 - NL1000)',
    formatTags: ['online', 'cash'],
    views: 3640,
    replies: 49,
    likes: 224,
    summary: 'Giải mã nguyên lý toán học đằng sau cú "Small Bet 30% Pot" khi mặt bài xuất hiện lá thứ 3 cùng chất ở vòng Turn và cách áp dụng để không tự cô lập mình.',
    handHistory: `[1. Ngoại cảnh & Tương quan vị trí/Stack trên bàn]
- Bối cảnh: Bàn 6-Max tiêu chuẩn (100BB). Hero mở cược tại Button, Villain phòng thủ tại Big Blind (BB).
- Hero cầm: [A♦ A♣] (Đôi Át không có chất cơ) hoặc [K♥ Q♠] (Đôi K có lá K cơ chặn thùng).

[2. Diễn biến hành động các vòng]
• Preflop: Hero (BTN) mở cược 2.5BB. BB Call. (Pot: 5.5BB).
• Flop: [K♠ 8♥ 3♥] (Mặt bài có 2 lá cơ mua thùng).
• Hành động Flop: BB Check. Hero C-bet 65% Pot (3.5BB) để tính tiền và bảo vệ bài. BB Call. (Pot: 12.5BB).
• Turn: [5♥] — Lá cơ thứ 3 xuất hiện trên bàn ([K♠ 8♥ 3♥ 5♥]), hoàn thiện các đường mua Thùng cơ!
• BB nhường lượt Check. Rất nhiều người chơi ở đây hoặc là sợ hãi Check theo, hoặc là nhắm mắt cược lớn 75% Pot. Tại sao cộng đồng r/Poker_Theory và GTO Solver lại chỉ ra rằng Cược Nhỏ 30% Pot (3.8BB) mới là nước đi thống trị tuyệt đối?`,
    detailedAnalysis: `[1. Ngoại cảnh & Tương quan bàn chơi]
- Tình huống đơn đấu (Single Raised Pot) kinh điển giữa Button (có vị trí) và Big Blind (ngoài vị trí).

[2. Diễn biến hành động các vòng]
- Flop có 2 lá cơ, Hero cược lớn và BB theo cược. Turn rơi lá cơ thứ 3 làm thay đổi hoàn toàn kết cấu mặt bài (Texture shift): Mọi bài mua thùng ở Flop giờ đã thành Thùng thật.

[3. Luận điểm gốc từ diễn đàn quốc tế (r/Poker_Theory)]
- Tại sao Cược Lớn 75% Pot ở Turn là lỗi nghiêm trọng: Khi lá cơ thứ 3 rơi xuống, dải bài Call Flop của BB chứa rất nhiều bài Thùng (Flush). Nếu bạn cầm Đôi Át hoặc Đôi K mà cược lớn 75% Pot, bạn tự biến mình thành con mồi: Đối thủ sẽ bỏ hết các bài yếu hơn và chỉ Call/Raise khi họ có Thùng hoặc 2 đôi.
- Sức mạnh của Cược Nhỏ 25%-33% Pot (Block/Thin Value Bet):
  1. Ép toàn bộ các bài Đôi K yếu hơn (KJ, KT), Đôi 8 (98, 87) hoặc các bài có 1 lá cơ nhỏ của BB vẫn phải trả tiền cho bạn.
  2. Giữ hũ tiền trong tầm kiểm soát và ngăn không cho đối thủ chủ động cược lừa dối (Bluff) lớn ở River nếu bạn Check.
  3. Nếu đối thủ Check-raise trước cú cược nhỏ của bạn, bạn dễ dàng nhận diện họ có Thùng thật để thoát thân với chi phí rẻ nhất.

[4. Đúc kết thực chiến chuẩn CLB để kiếm ăn ổn định]
- Khi mặt bài Turn rơi lá thứ 3 đồng chất (Flush hoàn thành):
  + Đừng Check bị động (vì bạn sẽ mất quyền chủ động và bị đối thủ dọa ở River).
  + Đừng Cược Lớn 75% Pot bằng 1 đôi (vì chỉ có bài mạnh hơn bạn mới theo).
  + Hãy dùng **Cược Nhỏ 25% - 33% Pot**: Vừa ăn thêm tiền mỏng từ các đôi yếu, vừa mua quyền xem River với giá siêu rẻ!`,
    gtoRecommendations: 'GTO Wizard / PioSOLVER: Trên các lá Turn hoàn thiện Thùng (Flush-completing turns), kích thước cược duy nhất được Solver sử dụng cho toàn bộ dải bài của người có vị trí là 25% - 33% Pot!',
    keyTakeaways: [
      'Khi mặt bài đổi cấu trúc (ra lá thứ 3 đồng chất hoàn thiện Thùng), phải giảm ngay kích thước cược xuống 25%-33% Pot.',
      'Cược nhỏ giúp bạn vừa ăn tiền các đôi yếu hơn, vừa tự ấn định mức giá rẻ để xem lá bài River.'
    ],
    proInteractions: [
      {
        id: 'pro-reddit-01',
        proName: 'GTO_Mechanic_PhD',
        proRole: 'r/Poker_Theory Top Contributor',
        proAvatarBg: 'bg-cyan-600',
        forumSource: 'RedditPoker',
        stance: 'gto',
        stanceLabel: '🧠 Cược Nhỏ 30% Pot Là Chân Lý Toán Học',
        stanceColor: 'bg-cyan-950 text-cyan-300 border-cyan-600',
        quote: 'Khi lá cơ thứ 3 rơi xuống, lợi thế bài cực mạnh (Nut Advantage) chuyển sang tay BB, buộc Button phải hạ kích thước cược xuống 30% Pot!',
        content: 'Đây là nguyên lý quan trọng nhất của Poker hiện đại trên r/Poker_Theory: Kích thước cược luôn tỷ lệ thuận với lợi thế bài cực mạnh (Nut Advantage). Ở Flop K-8-3 hai lá cơ, Button có AA, KK, AK nên cược lớn 65% là đúng. Nhưng khi Turn rơi 5 cơ, ai là người có nhiều tổ hợp Thùng hơn? Chính là Big Blind (vì BB phòng thủ rất nhiều bài đồng chất nhỏ và trung bình như Q9h, J7h, T6h, 96h). Khi đối thủ nắm nhiều bài Thùng như vậy, việc bạn hạ kích thước cược xuống 30% Pot với AA/KQ giúp bạn vẫn lấy được tiền từ Kx, 8x của họ mà không tự nộp mạng vào họng súng!',
        likes: 215,
        timeAgo: '7 giờ trước trên r/Poker_Theory'
      },
      {
        id: 'pro-reddit-02',
        proName: 'Exploit_Reg_200z',
        proRole: 'r/Poker_Theory Strategy Mod',
        proAvatarBg: 'bg-amber-600',
        forumSource: 'RedditPoker',
        stance: 'exploit',
        stanceLabel: '🎯 Khai Thác Thực Chiến: Chặn Đứng Đòn Bluff River Của Đối Thủ',
        stanceColor: 'bg-amber-950 text-amber-300 border-amber-600',
        quote: 'Cược 30% Pot ở Turn khiến đối thủ đóng băng, không dám Check-raise Bluff và ngoan ngoãn Check ở River!',
        content: 'Ngoài lợi ích lý thuyết, trong thực chiến cú cược 30% Pot ở Turn có tác dụng tâm lý cực lớn: Nếu bạn Check ở Turn vì sợ thùng, ở River đối thủ sẽ nã một cú cược 80% Pot khiến bạn đau đầu không biết nên Call hay Fold. Ngược lại, khi bạn chủ động gõ nhẹ 30% Pot ở Turn, 90% người chơi sẽ chỉ dám Check-call thụ động rồi Check tiếp ở River, cho phép bạn Check behind lật bài ăn hũ an toàn tuyệt đối!',
        likes: 143,
        timeAgo: '4 giờ trước trên r/Poker_Theory'
      }
    ],
    comments: []
  },
  {
    id: 'bai-viet-cd-01',
    mainSection: 'trao-doi-chinh',
    mainSectionName: '2. Phân tích sâu vấn đề',
    category: 'cash-online',
    categoryName: 'Bàn Đánh Tiền Mặt (Cash Games)',
    subForum: 'Hệ Thống Tư Duy & Sửa Lỗi Rò Rỉ (Leaks)',
    originalSource: 'Diễn đàn Chơi Poker (Chuyên đề Giảng viên Tidu)',
    title: 'Giải phẫu 5 lỗ hổng tư duy (Leaks) cố hữu khiến 90% người chơi Việt Nam cháy tài khoản khi cày bàn 6-Max',
    author: 'Tidu',
    authorRole: 'Giảng viên',
    authorPosts: 54,
    authorJoinDate: '24/04/2017',
    publishedAt: 'Chuyên đề cốt lõi CLB',
    isSticky: true,
    gameType: 'Phân tích hệ thống tư duy & Lỗ hổng chiến thuật',
    stakes: 'Áp dụng cho mọi mức cược từ Micro tới High Stakes',
    views: 6420,
    replies: 48,
    likes: 310,
    youtubeUrl: 'https://www.youtube.com/results?search_query=chơi+Poker+Tidu',
    youtubeTitle: 'Kênh YouTube Chơi Poker • Kinh Nghiệm Thực Chiến 6-Max',
    summary: 'Phân tích sâu có tính hệ thống của Giảng viên Tidu: Bóc tách gốc rễ tâm lý và toán học của 5 căn bệnh đốt tiền kinh điển nhất ở người chơi Việt Nam (tham bảo vệ Mù, hội chứng yêu Đôi lớn AA/KK, nhảy bàn gỡ gạc, lối đánh thụ động Calling Station và thiếu kiểm toán dữ liệu).',
    detailedAnalysis: `[PHÂN TÍCH SÂU HỆ THỐNG TƯ DUY - CHUYÊN ĐỀ GIẢNG VIÊN TIDU]

Qua nhiều năm đồng hành và mổ xẻ cơ sở dữ liệu (Database) của hàng trăm anh em trong cộng đồng "Chơi Poker", tôi nhận thấy hơn 90% người chơi thua tiền dài hạn KHÔNG PHẢI vì thiếu may mắn hay không thuộc luật, mà vì 5 lỗ hổng mang tính hệ thống (Systemic Leaks) dưới đây:

1. Lỗ hổng số 1: Tâm lý "Tiếc tiền mù" ở vị trí Small Blind & Big Blind
- Triệu chứng: Rất nhiều anh em có suy nghĩ "đã trót bỏ 0.5BB - 1BB tiền mù ra rồi, chỉ cần thêm một chút nữa để vào xem Flop biết đâu trúng bài".
- Bản chất toán học: Đây là nơi rò rỉ tiền lớn nhất trên đồ thị PokerTracker! Khi bạn Call thụ động ở SB/BB với các bài trung bình yếu (K9o, Q8s, J7s, A6o), bạn phải hành động đầu tiên (Out of Position) suốt cả 3 vòng Flop, Turn, River. Bạn vừa bị dẫn điểm dải bài (Range disadvantage), vừa mù thông tin, dẫn đến việc trúng 1 đôi thì chỉ ăn được hũ nhỏ nhưng khi đụng độ bài mạnh hơn của đối thủ lại mất cả hũ lớn (Reverse Implied Odds).

2. Lỗ hổng số 2: Hội chứng "Yêu bài tẩy" (Entitlement Tilt) — Không dám Bỏ Đôi lớn (AA, KK) khi mặt bài đổi chiều
- Triệu chứng: Khi cầm được Đôi Át (AA) hoặc Đôi K (KK), người chơi mặc định trong đầu rằng "Ván này mình bắt buộc phải thắng".
- Bản chất chiến thuật: AA và KK là siêu bài trước Flop, nhưng khi đã lật ra 4–5 lá chung trên mặt bài ẩm ướt (ví dụ 3 lá đồng chất hoặc 3 lá liên tiếp 7-8-9) và một đối thủ đánh kỷ luật bỗng nhiên Tố ngược (Check-raise) hoặc Đẩy tất tay ở Turn/River, lúc này Đôi Át chỉ còn là "1 đôi đơn thuần" (One Pair). Việc tiếc bài tẩy đẹp mà nhắm mắt bấm Call chính là nguyên nhân đốt sạch thành quả của cả 3 giờ cày cuốc trước đó.

3. Lỗ hổng số 3: Phá vỡ kỷ luật quản trị vốn — Nhảy lên bàn cược lớn hơn để "Gỡ nhanh"
- Triệu chứng: Đang chơi ở bàn NL20 ($0.10/$0.20) bị thua 3 buy-ins ($60), thay vì dừng lại hoặc giữ nguyên mức cược, người chơi lập tức nhảy lên bàn NL100 ($0.50/$1.00) với hy vọng "chỉ cần ăn 1 hũ là gỡ lại cả vốn lẫn lãi".
- Hậu quả hệ thống: Khi nhảy lên bàn cao hơn trong trạng thái tâm lý đang cay cú, bạn vừa phải đối đầu với những tay chơi cáo già hơn, vừa bị áp lực đồng tiền làm biến dạng quyết định (sợ hãi khi cần bluff, liều mạng khi cần fold). 99% các vụ "cháy sạch tài khoản trong 1 đêm" đều bắt nguồn từ hành vi này.

4. Lỗ hổng số 4: Lối đánh thụ động "Trạm Thu Phí" (Calling Station)
- Triệu chứng: Hiếm khi chủ động Tố thêm (3-bet) hoặc Cược ép, chỉ thích Check và Call để xem đối thủ làm gì hoặc chờ mua bán bài giá rẻ.
- Bản chất: Trong Poker, bạn có 2 cách để thắng một hũ tiền: (1) Có bài mạnh nhất khi lật bài, hoặc (2) Khiến mọi đối thủ khác Bỏ bài. Người chơi chỉ biết Check-Call đã tự tước bỏ 50% vũ khí của mình (Fold Equity) và biến mình thành con mồi để các tay chơi chủ động thoải mái định giá hũ tiền.

5. Lỗ hổng số 5: Đánh theo trí nhớ cảm tính, không bao giờ kiểm toán lại lịch sử ván bài
- Triệu chứng: Não bộ con người luôn có xu hướng chỉ nhớ những ván mình bị "đen đủi thua ngược" (Bad Beat) và quên sạch những ván mình đánh sai kỹ thuật. Nếu không định kỳ rà soát lại các nhóm tình huống thua lớn, bạn sẽ lặp lại đúng một sai lầm suốt 5 năm mà cứ ngỡ mình chỉ đang "kém may mắn".`,
    gtoRecommendations: `• Giải pháp khắc phục triệt để từ CLB Chơi Poker:
1. Tại vị trí Mù nhỏ (SB): Áp dụng chiến thuật "3-Bet hoặc Fold" — cắt bỏ hoàn toàn thói quen Call ngang lẻ tẻ.
2. Trước khi bấm Call một cú cược lớn ở Turn/River với AA/KK: Luôn dừng lại 5 giây và tự hỏi "Đối thủ đang cược Value bằng bài gì mà yếu hơn 1 đôi của mình?". Nếu không tìm ra câu trả lời, hãy tự hào bấm nút Fold!
3. Tuyệt đối khóa chặt mức cược theo quy tắc Bankroll 50-70 Buy-ins; không bao giờ bước lên bàn cao hơn khi đang âm tiền trong ngày.`,
    keyTakeaways: [
      'Bảo vệ tiền ở vị trí Mù bằng cách bỏ bài dứt khoát trước Flop chính là cách kiếm tiền nhanh nhất.',
      'Đôi Át (AA) sau Flop chỉ là 1 đôi — biết buông bỏ khi mặt bài sập bẫy là ranh giới giữa Cao thủ và Nghiệp dư.',
      'Không bao giờ tăng mức cược để gỡ thua; kỷ luật quản lý vốn đứng trên mọi kỹ năng đọc bài.'
    ],
    comments: [
      {
        id: 'bl-cd-01',
        author: 'ThanhVien_KyCuu',
        authorBadge: 'Thành viên VIP',
        authorRole: 'Học viên',
        avatarBg: 'bg-amber-600',
        time: 'Hôm qua',
        content: 'Bài phân tích sâu của Thầy Tidu chạm đúng tim đen của 90% anh em! Cứ lần nào dính lỗi số 2 và số 3 là y như rằng bay sạch thành quả.',
        likes: 29
      }
    ]
  },
  {
    id: 'bai-viet-cd-02',
    mainSection: 'trao-doi-chinh',
    mainSectionName: '2. Phân tích sâu vấn đề',
    category: 'toan-hoc',
    categoryName: 'Toán Học & Lý Thuyết GTO',
    subForum: 'Cấu Trúc Bàn Chơi & Toán Học Lợi Nhuận',
    originalSource: 'Diễn đàn Chơi Poker (Ban Nghiên Cứu Chiến Thuật CLB)',
    title: 'Bẫy Tiền Phế (Rake Trap) & Nghịch lý Bàn Đông Người: Tại sao áp dụng máy móc lý thuyết High Stakes lại thua nặng ở bàn nhỏ và bàn Live?',
    author: 'Tidu',
    authorRole: 'Giảng viên',
    authorPosts: 55,
    authorJoinDate: '24/04/2017',
    publishedAt: 'Chuyên đề phân tích sâu',
    gameType: 'Phân tích cấu trúc toán học & Khai thác thực tế',
    stakes: 'Trọng tâm cho bàn Cash Micro/Low Stakes & Live Cash',
    views: 4120,
    replies: 38,
    likes: 245,
    summary: 'Nhiều học viên học thuộc lòng bảng bài Solver của các cao thủ thế giới nhưng mang vào bàn cược nhỏ hoặc bàn Live nhiều người lại thua triền miên. Bài phân tích sâu này mổ xẻ 2 yếu tố ngầm quyết định túi tiền của bạn: Tác động bào mòn của Tiền phế (Rake) và Sự sụp đổ của Bluff trong hũ nhiều người.',
    detailedAnalysis: `[PHÂN TÍCH SÂU VẤN ĐỀ: KHOẢNG CÁCH GIỮA LÝ THUYẾT CAO CẤP VÀ BÀN CHƠI THỰC TẾ]

Rất nhiều người chơi nghiêm túc đầu tư hàng trăm giờ xem video của các siêu cao thủ đánh NL5000 hoặc đọc bảng giải bài máy tính (GTO Solver), nhưng khi áp dụng vào bàn cược vừa và nhỏ (NL10 - NL100) hoặc bàn Live thực tế lại bị âm tiền. Nguyên nhân không nằm ở việc lý thuyết sai, mà vì bạn đã bỏ qua 2 biến số nền tảng:

1. Biến số 1: "Kẻ ăn mòn thầm lặng" mang tên Tiền Phế Bàn Chơi (Rake Structure)
- Ở các bàn High Stakes ($25/$50), tiền phế (Rake) tính theo tỷ lệ Big Blind là cực kỳ nhỏ (dưới 0.5BB mỗi hũ). Do đó các Pro có thể mở cược và Call 3-Bet rất rộng với các bài biên (marginal hands) có kỳ vọng lợi nhuận mỏng (+0.2BB).
- Ngược lại, ở bàn cược nhỏ và bàn Live, tiền phế thường chiếm tới 5% hũ tiền với mức trần rất cao (tương đương 8BB - 12BB/100 ván bị nhà cái thu đi!).
- Hệ quả sống còn: Một ván bài có lãi nhẹ +0.3BB trong môi trường không phế sẽ lập tức biến thành LỖ NẶNG (-0.5BB) sau khi trừ tiền phế khi mở Flop! Đặc biệt là hành động "Call ngang trước Flop" (Flat call): Khi bạn chỉ Call để vào xem Flop, bạn lập tức kích hoạt cơ chế thu phế của bàn chơi ("No Flop, No Drop").

2. Biến số 2: Nghịch lý Hũ Đông Người (Multi-way Pot Paradox)
- Toàn bộ lý thuyết Solver tiêu chuẩn được tính toán cho cuộc đấu tay đôi 1v1 (Heads-up Pot), nơi đối thủ có khoảng 40% - 50% tần suất bỏ bài ở Flop.
- Trên bàn thực tế của người Việt hoặc bàn Live, thường xuyên có 3 đến 4 người cùng vào xem Flop.
- Toán học của Multi-way Pot: Giả sử mỗi người chơi giải trí có 60% khả năng Call cú cược của bạn ở Flop. Nếu đấu với 1 người, khả năng bạn cướp được hũ (Bluff thành công) là 40%. Nhưng nếu có 3 đối thủ trong hũ, xác suất cả 3 người cùng Fold chỉ còn: 0.4 × 0.4 × 0.4 = 6.4%!
- Nghĩa là trong hũ 3–4 người, mọi đòn Cược tiếp nối lừa dối (C-bet Bluff) bằng bài trượt hoàn toàn là hành động tự đốt tiền!

3. Hệ thống điều chỉnh chiến thuật thực chiến của CLB để thắng ròng sau phế:
- Trước Flop: Cắt bỏ các pha Call ngang thụ động ở vị trí giữa và Mù nhỏ; chuyển sang lối đánh "Tố 3-Bet để ăn ngay hũ tiền không mất phế" hoặc "Bỏ bài" với các bài biên.
- Sau Flop trong hũ nhiều người: Tuyệt đối tắt chế độ Bluff tự động; chỉ cược khi có bài thành phẩm thật hoặc đường mua bài cực mạnh (Nut Draw), nhưng một khi đã cầm bài mạnh thì phải cược kích thước lớn (75% - 85% Pot) để thu tối đa giá trị từ những người thích theo bài.`,
    gtoRecommendations: `• Nguyên tắc vàng thích nghi môi trường bàn chơi:
1. Bàn thu phế càng cao -> Dải bài mở cược và theo cược trước Flop càng phải siết chặt và ưu tiên 3-Bet lấy hũ sớm.
2. Hũ tiền có từ 3 người trở lên -> Chuyển 100% sang lối đánh Value-heavy (Cược dày khi có bài thật, Check-Fold dứt khoát khi trượt bài).`,
    keyTakeaways: [
      'Không bao giờ sao chép nguyên xi dải bài của bàn High Stakes không phế vào bàn cược nhỏ chịu phế 5%.',
      'Trong hũ tiền từ 3 người trở lên, xác suất Bluff thành công giảm theo cấp số nhân — hãy ngừng đốt chip bằng C-bet tự động.',
      'Kiếm tiền từ sai lầm thích Call của đám đông bằng cách cược thật lớn khi bạn nắm giữ bài mạnh.'
    ],
    comments: [
      {
        id: 'bl-cd-02',
        author: 'Quang_ProGrinder',
        authorBadge: 'Cao Thủ Chiến Thuật',
        authorRole: 'Cao Thủ Chiến Thuật',
        avatarBg: 'bg-emerald-600',
        time: '3 giờ trước',
        content: 'Bài phân tích quá sâu sắc! Trước em cứ thắc mắc sao học C-bet 1/3 pot của nước ngoài mà đem vào bàn 4 người toàn bị call tới bến, đọc xong bài toán xác suất 6.4% này mới tỉnh ngộ.',
        likes: 42
      },
      {
        id: 'bl-cd-04',
        author: 'ThanhVien_KyCuu',
        authorBadge: 'Thành viên VIP',
        authorRole: 'Thành viên VIP',
        avatarBg: 'bg-purple-600',
        time: '2 giờ trước',
        content: 'Đây chính là thứ anh em cần phân tích sâu: hiểu bản chất cấu trúc bàn chơi và tiền phế chứ không phải học vẹt từng ván bài lẻ tẻ!',
        likes: 38
      }
    ]
  },
  {
    id: 'bai-viet-cd-03',
    mainSection: 'trao-doi-chinh',
    mainSectionName: '2. Phân tích sâu vấn đề',
    category: 'tam-ly',
    categoryName: 'Tâm Lý & Quản Lý Tiền Vốn',
    subForum: 'Tâm Lý Học Hành Vi & Kỷ Luật Thực Chiến',
    originalSource: 'Diễn đàn Chơi Poker (Chuyên đề Tâm Lý Thực Chiến CLB)',
    title: 'Hội chứng "Thắng suốt 5 tiếng, bay sạch trong 15 phút cuối": Giải mã cơ chế sụp đổ kỷ luật cuối phiên và Quy tắc Khóa Lợi Nhuận',
    author: 'QuanTri_Bankroll',
    authorRole: 'Biên tập',
    authorPosts: 412,
    authorJoinDate: '22/09/2019',
    publishedAt: 'Chuyên đề phân tích sâu',
    gameType: 'Tâm lý học thực chiến & Quản trị phiên chơi (Session Management)',
    stakes: 'Áp dụng cho cả Cash Game và Giải đấu MTT',
    views: 3850,
    replies: 41,
    likes: 268,
    summary: 'Tại sao rất nhiều người chơi có kỹ thuật tốt, kiên nhẫn tích góp từng hũ nhỏ suốt 4-5 tiếng đồng hồ, nhưng chỉ vì 1 ván thua ngược ở cuối buổi lại mất kiểm soát và ném toàn bộ tiền lời lẫn vốn trong 15 phút? Phân tích sâu cơ chế mệt mỏi thần kinh và quy tắc bảo vệ thành quả.',
    detailedAnalysis: `[PHÂN TÍCH SÂU VẤN ĐỀ: CƠ CHẾ SỤP ĐỔ KỶ LUẬT CUỐI PHIÊN CHƠI]

Trong giới Poker thực chiến có một kịch bản lặp đi lặp lại đến đau lòng: Bạn ngồi vào bàn với sự tập trung cao độ (A-Game), đánh cực kỳ chắc chắn suốt 4 tiếng, tích lũy được +150BB tiền lãi. Nhưng đến tiếng thứ 5, sau một ván bị đối thủ mua thùng 2 lá ở River làm bạn tụt xuống còn +60BB, mặc dù bạn VẪN ĐANG LÃI, não bộ của bạn lại phát tín hiệu như thể bạn vừa bị cướp mất 90BB! Và chỉ trong 15 phút tiếp theo, bạn lao vào 2 ván All-in vô kỷ luật để rồi đứng dậy với hai bàn tay trắng.

1. Giải mã hiệu ứng tâm lý học "Điểm Tham Chiếu Đỉnh" (Peak Reference Point Trap)
- Theo Lý thuyết Triển vọng (Prospect Theory) trong kinh tế học hành vi: Con người không đánh giá lợi nhuận dựa trên số vốn đầu buổi, mà tự động neo "Điểm tham chiếu" vào mức tiền cao nhất vừa đạt được trong buổi hôm đó (Peak Stack).
- Khi stack của bạn tụt từ +150BB xuống +60BB, bộ não rơi vào trạng thái "Đau đớn vì mất mát" (Loss Aversion) y hệt như đang thua lỗ 90BB. Cơn khát muốn lấy lại con số +150BB ngay lập tức khiến bạn phá bỏ hoàn toàn chiến thuật TAG kỷ luật và lao vào các pha cược 50/50 đầy cảm tính.

2. Hiện tượng "Cạn kiệt năng lượng ra quyết định" (Decision Fatigue)
- Bộ não của một VĐV Poker chỉ duy trì được chất lượng xử lý thông tin đỉnh cao (A-Game) trong khoảng 90 đến 120 phút liên tục trước khi cần nghỉ ngắn.
- Sau 4–5 giờ căng thẳng, vùng vỏ não trước trán (chịu trách nhiệm kiểm soát sự kiên nhẫn và khả năng Bỏ bài) bị suy giảm hoạt động mạnh. Lúc này bản năng hiếu thắng trỗi dậy: Bạn bắt đầu lười tính toán dải bài đối thủ, bấm Call nhanh hơn vì "lười suy nghĩ" và dễ dàng rơi vào trạng thái C-Game mà không hề tự biết.

3. Quy trình 3 Chốt Chặn Khóa Lợi Nhuận chuẩn CLB Chơi Poker:
- Chốt chặn 1 (Tách biệt từng ván bài): Luôn quy đổi giá trị theo Big Blind của ván hiện tại, tuyệt đối không bao giờ nhìn vào số dư đỉnh điểm trong phiên để tiếc nuối.
- Chốt chặn 2 (Luật 90 phút): Cứ mỗi 90 phút chơi liên tục, bắt buộc đứng dậy rời màn hình/bàn chơi 10 phút để tái tạo sự tỉnh táo thần kinh.
- Chốt chặn 3 (Cắt phiên khi xuất hiện 2 dấu hiệu C-Game): Ngay khi bạn nhận thấy mình vừa thực hiện 1 pha Call vì tức giận hoặc bắt đầu xem Flop những bài rác không nằm trong bảng bài chuẩn, hãy lập tức kết thúc phiên chơi ngay vòng mù đó — bất kể đang thắng hay đang thua!`,
    gtoRecommendations: `• Bộ câu hỏi tự kiểm tra nhanh sau mỗi ván thua lớn (Post-Bad-Beat Protocol):
1. "Nếu bây giờ mình mới bắt đầu ngồi vào bàn với số tiền hiện tại, mình có thực hiện nước đi vừa rồi không?"
2. "Mình đang tiếp tục ngồi chơi vì bàn chơi còn nhiều đối thủ yếu (+EV), hay chỉ vì mình đang cay cú muốn gỡ lại số chip vừa mất?" — Nếu là vế thứ hai, hãy đứng dậy ngay lập tức!`,
    keyTakeaways: [
      'Đừng bao giờ lấy mức tiền cao nhất trong buổi làm mốc tham chiếu để rồi tự đẩy mình vào tâm lý gỡ gạc khi vẫn đang có lãi.',
      'Lợi nhuận cuối năm của bạn được quyết định bởi số tiền bạn tiết kiệm được trong những ngày đánh C-Game, chứ không chỉ những ngày đánh A-Game.',
      'Biết đứng dậy đúng lúc khi thể lực và sự kiên nhẫn đã cạn là kỹ năng sinh tồn cao nhất của người chơi chuyên nghiệp.'
    ],
    comments: [
      {
        id: 'bl-cd-05',
        author: 'KiemChe_LaThang',
        authorBadge: 'Học viên VIP',
        authorRole: 'Học viên',
        avatarBg: 'bg-blue-600',
        time: '1 giờ trước',
        content: 'Đúng chuẩn căn bệnh kinh niên của em luôn! Đánh thắng cả buổi từ 8h tối đến 12h đêm, xong 12h15 bị đè 1 ván thế là nổi điên đốt sạch cả vốn lẫn lời lúc 12h30.',
        likes: 51
      }
    ]
  }
];

// Endpoint: Lấy danh sách bài viết
app.get('/api/forum/threads', (req, res) => {
  try {
    const { category, section, search } = req.query;
    let list = [...FORUM_THREADS];

    if (section && section !== 'all') {
      list = list.filter((t) => t.mainSection === section);
    }

    if (category && category !== 'all') {
      list = list.filter((t) => t.category === category);
    }

    if (search && String(search).trim()) {
      const q = String(search).toLowerCase();
      list = list.filter(
        (t) =>
          t.title.toLowerCase().includes(q) ||
          t.summary.toLowerCase().includes(q) ||
          t.detailedAnalysis.toLowerCase().includes(q) ||
          t.author.toLowerCase().includes(q) ||
          t.originalSource.toLowerCase().includes(q)
      );
    }

    res.json({ threads: list, total: list.length });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Lỗi lấy danh sách bài viết' });
  }
});

// Endpoint: Lấy chi tiết 1 bài viết theo ID
app.get('/api/forum/threads/:id', (req, res) => {
  const { id } = req.params;
  const thread = FORUM_THREADS.find((t) => t.id === id);
  if (!thread) {
    return res.status(404).json({ error: 'Không tìm thấy bài viết' });
  }
  res.json({ thread });
});

// Bộ nhớ đếm phiên truy cập thực tế (Online trong 5 phút gần nhất)
const ACTIVE_SESSIONS: Record<string, { lastSeen: number; username: string }> = {};
const SESSION_TIMEOUT_MS = 5 * 60 * 1000;

// Endpoint: Lấy thống kê diễn đàn (Số liệu thực tế 100%)
app.get('/api/forum/stats', async (req, res) => {
  const now = Date.now();
  const sessionId = String(req.query.sessionId || req.ip || 'default-session');
  const username = String(req.query.username || 'Khách');

  ACTIVE_SESSIONS[sessionId] = { lastSeen: now, username };

  // Xóa các phiên đã thoát quá 5 phút
  for (const key of Object.keys(ACTIVE_SESSIONS)) {
    if (now - ACTIVE_SESSIONS[key].lastSeen > SESSION_TIMEOUT_MS) {
      delete ACTIVE_SESSIONS[key];
    }
  }

  let realRegisteredMembers: any[] = [];
  let cloudSessions: Record<string, { lastSeen: number; username: string }> = {};

  try {
    const getRes = await fetch('https://api.restful-api.dev/objects/ff808181a09d98f701a166d1d622639f');
    if (getRes.ok) {
      const currentObj: any = await getRes.json();
      const currentData = currentObj.data || {};
      if (Array.isArray(currentData.members)) {
        realRegisteredMembers = currentData.members;
      }
      if (currentData.sessions && typeof currentData.sessions === 'object') {
        cloudSessions = currentData.sessions;
      }

      // Gộp phiên hiện tại vào Cloud Sessions và lọc phiên trong 5 phút
      const mergedSessions: Record<string, { lastSeen: number; username: string }> = {
        ...cloudSessions,
        ...ACTIVE_SESSIONS
      };
      for (const k of Object.keys(mergedSessions)) {
        if (now - mergedSessions[k].lastSeen > SESSION_TIMEOUT_MS) {
          delete mergedSessions[k];
        }
      }
      cloudSessions = mergedSessions;

      // Lưu lại phiên online thực tế lên Cloud DB (không chặn phản hồi)
      fetch('https://api.restful-api.dev/objects/ff808181a09d98f701a166d1d622639f', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: 'choipoker_admin_database',
          data: {
            ...currentData,
            members: realRegisteredMembers,
            sessions: cloudSessions
          }
        })
      }).catch(() => {});
    }
  } catch (e) {
    // Fallback dùng bộ nhớ trực tiếp nếu mạng chậm
    cloudSessions = { ...ACTIVE_SESSIONS };
  }

  // Đếm danh sách tài khoản đăng ký thực tế (1 tài khoản sáng lập Tidu + số tài khoản đăng ký mới không trùng lặp)
  const uniqueMemberNames = new Set<string>(['tidu']);
  for (const m of realRegisteredMembers) {
    if (m && m.username) {
      uniqueMemberNames.add(String(m.username).trim().toLowerCase());
    }
  }

  const totalMembers = uniqueMemberNames.size;
  const newestMember =
    realRegisteredMembers.length > 0
      ? realRegisteredMembers[realRegisteredMembers.length - 1].username
      : 'Tidu';

  const activeSessionEntries = Object.entries(cloudSessions);
  const uniqueOnlineIdentifiers = new Set<string>();
  for (const [sid, s] of activeSessionEntries) {
    const uname = (s.username || 'Khách').trim();
    if (uname && uname.toLowerCase() !== 'khách') {
      uniqueOnlineIdentifiers.add('user:' + uname.toLowerCase());
    } else {
      uniqueOnlineIdentifiers.add('guest:' + sid);
    }
  }
  const onlineMembers = Math.max(1, uniqueOnlineIdentifiers.size);
  const onlineUsers = Array.from(
    new Set(activeSessionEntries.map(([, s]) => s.username).filter(Boolean))
  );

  const totalViews = FORUM_THREADS.reduce((acc, t) => acc + t.views, 0);
  const totalActualPosts = FORUM_THREADS.reduce(
    (acc, t) => acc + 1 + t.comments.length + (t.proInteractions ? t.proInteractions.length : 0),
    0
  );

  const countryHeader = String(
    req.headers['x-vercel-ip-country'] || req.headers['cf-ipcountry'] || 'VN'
  ).toUpperCase();

  const countryToLang: Record<string, string> = {
    VN: 'vi',
    US: 'en',
    GB: 'en',
    AU: 'en',
    CA: 'en',
    NZ: 'en',
    SG: 'en',
    PH: 'en',
    IN: 'en',
    CN: 'zh-CN',
    TW: 'zh-CN',
    HK: 'zh-CN',
    JP: 'ja',
    KR: 'ko',
    FR: 'fr',
    DE: 'de',
    AT: 'de',
    CH: 'de',
    ES: 'es',
    MX: 'es',
    AR: 'es',
    BR: 'pt',
    PT: 'pt',
    RU: 'ru',
    TH: 'th'
  };

  const nativeLang = countryToLang[countryHeader] || (countryHeader === 'VN' ? 'vi' : 'en');

  res.json({
    totalThreads: FORUM_THREADS.length,
    totalPosts: totalActualPosts,
    totalMembers,
    newRegisteredCount: realRegisteredMembers.length,
    newestMember,
    totalViews,
    onlineMembers,
    onlineUsers,
    detectedCountry: countryHeader,
    nativeLang
  });
});

// Endpoint: Gửi bình luận bài viết
app.post('/api/forum/threads/:id/comment', (req, res) => {
  const { id } = req.params;
  const { author, content, authorRole, stance, stanceLabel, quote } = req.body;

  const thread = FORUM_THREADS.find((t) => t.id === id);
  if (!thread) {
    return res.status(404).json({ error: 'Không tìm thấy bài viết' });
  }

  const role = authorRole || 'Học viên';
  const newComment = {
    id: 'bl-' + Date.now(),
    author: author || 'Thành viên Học Poker',
    authorBadge: role === 'Giảng viên' ? 'Giảng viên' : role === 'Biên tập' ? 'Biên tập viên' : 'Học viên',
    authorRole: role,
    avatarBg: role === 'Giảng viên' ? 'bg-amber-600' : role === 'Biên tập' ? 'bg-blue-600' : 'bg-emerald-600',
    time: 'Vừa xong',
    content: content || '',
    likes: 0,
  };

  thread.comments.push(newComment);
  thread.replies += 1;

  let newProInteraction: ProInteraction | undefined = undefined;
  if (thread.proInteractions) {
    const stanceType = stance || 'exploit';
    const sLabel = stanceLabel || (
      stanceType === 'shove' ? '🔥 Ủng hộ Tố / Shove All-in' :
      stanceType === 'fold' ? '🛡️ Khuyên Bỏ Bài / Fold' :
      stanceType === 'gto' ? '🧠 Phân Tích Solver GTO' :
      '🎯 Góc Nhìn Thực Chiến Thành Viên'
    );
    const sColor = (
      stanceType === 'shove' ? 'bg-rose-950 text-rose-300 border-rose-600' :
      stanceType === 'fold' ? 'bg-emerald-950 text-emerald-300 border-emerald-600' :
      stanceType === 'gto' ? 'bg-cyan-950 text-cyan-300 border-cyan-600' :
      'bg-amber-950 text-amber-300 border-amber-600'
    );

    newProInteraction = {
      id: 'pro-user-' + Date.now(),
      proName: author || 'Thành viên CLB',
      proRole: `${role} CLB Chơi Poker`,
      proAvatarBg: role === 'Giảng viên' ? 'bg-amber-600' : role === 'Biên tập' ? 'bg-blue-600' : 'bg-emerald-600',
      forumSource: (thread.originalSource.includes('TwoPlusTwo') || thread.originalSource.includes('2+2')) ? 'TwoPlusTwo' : (thread.originalSource.includes('CardsChat') ? 'CardsChat' : 'PokerStrategy'),
      stance: stanceType,
      stanceLabel: sLabel,
      stanceColor: sColor,
      quote: quote || (content && content.length > 80 ? content.substring(0, 80) + '...' : content),
      content: content || '',
      likes: 1,
      timeAgo: 'Vừa xong'
    };

    thread.proInteractions.push(newProInteraction);
  }

  res.json({
    success: true,
    comment: newComment,
    totalReplies: thread.replies,
    proInteraction: newProInteraction
  });
});

// Endpoint: Gửi tình huống lên Bàn Mổ Xẻ kèm thông số bàn chơi
app.post('/api/forum/submit-hand', async (req, res) => {
  try {
    const {
      author,
      position,
      stack,
      gameType,
      stage,
      cards,
      board,
      situation,
      title
    } = req.body;

    const newId = 'hand-' + Date.now();
    const threadTitle = title || `[Bàn Mổ Xẻ] ${position || 'Vị trí'} cầm ${cards || 'bài'} - Stack ${stack || '100BB'} (${gameType || 'Cash/MTT'})`;

    let aiVerdict = '';
    const promptText = `
Mổ xẻ ván bài thực chiến theo đúng quy chuẩn Trọng Tài Chuyên Môn của CLB:
- Tác giả: ${author || 'Thành viên CLB'}
- Vị trí: ${position || 'Chưa rõ'}
- Độ sâu Stack: ${stack || '100BB'}
- Ngoại cảnh & Thể loại: ${gameType || 'Cash game'}
- Giai đoạn giải: ${stage || 'Đánh tiền mặt'}
- Bài tẩy: ${cards || 'Chưa rõ'}
- Mặt bài: ${board || 'Chưa chia'}
- Tình huống diễn biến & Thắc mắc: ${situation || ''}

Hãy đưa ra PHÁN QUYẾT ĐỘC LẬP theo đúng 3 mục sau:
[Mục 1: Đánh giá tính hợp lý của từng phương án mà thành viên nêu ra]
[Mục 2: Chỉ rõ điểm mù hoặc lỗi tư duy nếu có (Hội chứng tiếc bài, đánh theo cảm tính, quên SPR/ICM...)]
[Mục 3: Chốt phương án xử lý tối ưu nhất vừa đảm bảo an toàn vừa tối đa hóa lợi nhuận thực chiến (+EV)]
`;

    if (apiKey) {
      try {
        const response = await ai.models.generateContent({
          model: 'gemini-3.8-flash',
          contents: [{ role: 'user', parts: [{ text: promptText }] }],
          config: {
            systemInstruction: POKER_VIETNAMESE_PROMPT,
            temperature: 0.3,
          },
        });
        aiVerdict = response.text || '';
      } catch (e) {
        console.warn('Lỗi gọi Gemini cho hand submit:', e);
      }
    }

    if (!aiVerdict) {
      aiVerdict = `[PHÁN QUYẾT TỪ AI TRỌNG TÀI CHUYÊN MÔN CLB]

[Mục 1: Đánh giá tính hợp lý của từng phương án mà thành viên nêu ra]
- Hướng Theo cược (Call): Rất bị động khi mặt bài kết nối cao, dễ bị đối thủ cược ép ở các vòng sau.
- Hướng Tố ngược (Raise / All-in): Chỉ hợp lý khi bạn nắm giữ bài tẩy có lá bài chặn (Blocker) hoặc bài thực sự áp đảo; nếu tố bừa sẽ tự dồn mình vào rủi ro mất trắng stack.
- Hướng Bỏ bài (Fold): Là phương án kỷ luật tối cao nếu nhận thấy dải bài đối thủ đại diện cho bài cực mạnh.

[Mục 2: Chỉ rõ điểm mù hoặc lỗi tư duy nếu có]
- Điểm mù 1: Cố chấp Call vì "đã bỏ vào hũ quá nhiều chip" (Hội chứng tiếc bài) mà quên mất quyết định tại thời điểm hiện tại mới quyết định lợi nhuận.
- Điểm mù 2: Không tính toán chỉ số SPR (Độ sâu stack so với hũ tiền) khiến bản thân bị kẹt vào Turn và River mà không còn đường rút lui.

[Mục 3: Chốt phương án xử lý tối ưu nhất vừa đảm bảo an toàn vừa tối đa hóa lợi nhuận thực chiến]
- Phương án tối ưu chuẩn CLB: Tận dụng tối đa lợi thế vị trí (${position || 'BTN/CO'}); nếu ở ngoài vị trí hãy chơi thật kỷ luật; khi có cơ hội hãy cược dày (Value bet) để đối thủ trả giá; nếu dính bẫy hãy dứt khoát buông bài để bảo toàn vốn.
- Châm ngôn CLB: "Biết bỏ bài đúng lúc là khởi đầu của một tay săn mồi đẳng cấp!"`;
    }

    const newThread: ForumThread = {
      id: newId,
      mainSection: 'trao-doi-chinh',
      mainSectionName: '2. Phân tích sâu vấn đề',
      category: 'cash-online',
      categoryName: 'Bàn Đánh Tiền Mặt (Cash Games)',
      subForum: 'Bàn Mổ Xẻ Tình Huống Thành Viên',
      originalSource: 'Diễn đàn Chơi Poker (Thành viên gửi trực tiếp)',
      title: threadTitle,
      author: author || 'Học viên CLB',
      authorRole: 'Học viên',
      authorPosts: 12,
      authorJoinDate: 'Tháng 10/2026',
      publishedAt: 'Vừa gửi lên Bàn Mổ Xẻ',
      gameType: `${gameType || 'Cash game'} • Vị trí: ${position || 'Hero'} • Stack: ${stack || '100BB'}`,
      stakes: `Giai đoạn: ${stage || 'Tiêu chuẩn'} | Bài: ${cards || 'Bài tẩy'}`,
      views: 1,
      replies: 1,
      likes: 1,
      summary: `Tình huống tại vị trí ${position || 'Hero'}, Stack ${stack || '100BB'}. ${situation || ''}`.slice(0, 180),
      handHistory: `[THÔNG SỐ BÀN CHƠI THỰC CHIẾN]
- Vị trí của bạn: ${position || 'Chưa điền'}
- Độ sâu Stack: ${stack || '100BB'}
- Ngoại cảnh / Thể loại: ${gameType || 'Cash Game'}
- Giai đoạn giải: ${stage || 'Đánh tiền mặt'}
- Bài tẩy: ${cards || 'Không rõ'}
- Mặt bài chung: ${board || 'Chưa chia'}

[DIỄN BIẾN & THẮC MẮC]
${situation || 'Cần ban cố vấn và anh em mổ xẻ phương án tối ưu.'}`,
      detailedAnalysis: aiVerdict,
      gtoRecommendations: `• Khuyến nghị từ AI Trọng Tài: Hãy luôn tuân thủ nguyên tắc quản lý vốn, đọc bài theo khoảng bài (Range) chứ không đọc từng lá đơn lẻ.`,
      keyTakeaways: [
        `Kiểm soát rủi ro dựa trên độ sâu Stack ${stack || '100BB'} và vị trí ${position || 'bàn'}.`,
        'Loại bỏ hoàn toàn tư duy cảm tính, kiên định với lối chơi kỷ luật thực chiến.',
        'Nhận phán quyết AI Trọng Tài và rút kinh nghiệm cho các ván tương tự.'
      ],
      comments: [
        {
          id: 'cmt-ai-' + Date.now(),
          author: 'AI_TrongTai_CLB',
          authorBadge: 'AI Trọng Tài',
          authorRole: 'Giảng viên',
          avatarBg: 'bg-amber-600',
          time: 'Vừa xong',
          content: '⚡ AI Trọng Tài đã tiếp nhận và mổ xẻ ván bài của bạn theo đúng 3 yếu tố chuẩn mực của CLB! Mời anh em thành viên cùng vào bình luận, chấm điểm và góp ý nhé.',
          likes: 12
        }
      ]
    };

    FORUM_THREADS.unshift(newThread);
    res.json({ success: true, thread: newThread });
  } catch (err: any) {
    console.error('Lỗi gửi hand:', err);
    res.status(500).json({ error: 'Không thể xử lý tình huống' });
  }
});

// Endpoint: Trợ lý AI Cố Vấn giải đáp Poker 100% tiếng Việt
app.post('/api/gemini/chat', async (req, res) => {
  try {
    const { message, question } = req.body;
    const userPrompt = String(message || question || '').trim();

    if (!userPrompt) {
      return res.status(400).json({ error: 'Vui lòng nhập câu hỏi' });
    }

    if (!apiKey) {
      return res.json({
        text: `[Học Poker - Cố Vấn Tự Động]: Câu hỏi của bạn về "${userPrompt}" rất hay!
- Về nguyên tắc cơ bản: Bạn cần luôn chú ý tới Vị trí (Position) và Tỷ lệ hũ tiền (Pot Odds).
- Hãy tham khảo các bài viết mới từ TwoPlusTwo, CardsChat và PokerStrategy trên diễn đàn để nắm rõ các thế bài tương tự nhé!`
      });
    }

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: [{ role: 'user', parts: [{ text: userPrompt }] }],
      config: {
        systemInstruction: POKER_VIETNAMESE_PROMPT,
        temperature: 0.3,
      },
    });

    res.json({ text: response.text || '' });
  } catch (err: any) {
    console.error('Lỗi trợ lý:', err);
    res.status(500).json({
      text: 'Hiện tại hệ thống AI đang bận. Bạn vui lòng xem các bài viết chuyên môn trong các chuyên mục diễn đàn nhé!'
    });
  }
});

// ========================================================
// HỆ THỐNG LƯU TRỮ & BÁO CÁO THÀNH VIÊN CHO TRỢ LÝ ADMIN
// ========================================================
const CLOUD_DB_URL = 'https://api.restful-api.dev/objects/ff808181a09d98f701a166d1d622639f';
const NTFY_LOG_URL = 'https://ntfy.sh/choipoker_tidu_admin_log_888999';

app.post('/api/forum/register', async (req, res) => {
  try {
    const { username, role, wolfLevel, wolfTitle } = req.body;
    const record = {
      username: username || 'Unknown',
      role: role || 'Học viên',
      wolfLevel: wolfLevel || 1,
      wolfTitle: wolfTitle || 'Gà Mới Nhập Đàn',
      registeredAt: new Date().toLocaleString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh' }),
      timestamp: Date.now()
    };

    // Ghi log dự phòng sang ntfy
    fetch(NTFY_LOG_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type: 'NEW_MEMBER', ...record })
    }).catch(() => {});

    // Cập nhật Cloud DB vĩnh viễn
    const getRes = await fetch(CLOUD_DB_URL);
    if (getRes.ok) {
      const currentObj: any = await getRes.json();
      const currentData = currentObj.data || { members: [], verifications: [] };
      const members = Array.isArray(currentData.members) ? currentData.members : [];
      members.push(record);

      await fetch(CLOUD_DB_URL, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: 'choipoker_admin_database',
          data: {
            ...currentData,
            members,
            updatedAt: record.registeredAt
          }
        })
      });
    }

    res.json({ success: true, member: record });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Lỗi lưu đăng ký' });
  }
});

app.post('/api/forum/verify-profile', async (req, res) => {
  try {
    const record = {
      ...req.body,
      submittedAt: new Date().toLocaleString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh' }),
      timestamp: Date.now()
    };

    fetch(NTFY_LOG_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type: 'STAR_VERIFICATION', ...record })
    }).catch(() => {});

    const getRes = await fetch(CLOUD_DB_URL);
    if (getRes.ok) {
      const currentObj: any = await getRes.json();
      const currentData = currentObj.data || { members: [], verifications: [] };
      const verifications = Array.isArray(currentData.verifications) ? currentData.verifications : [];
      verifications.push(record);

      await fetch(CLOUD_DB_URL, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: 'choipoker_admin_database',
          data: {
            ...currentData,
            verifications,
            updatedAt: record.submittedAt
          }
        })
      });
    }

    res.json({ success: true, verification: record });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Lỗi lưu hồ sơ xét duyệt' });
  }
});

app.get('/api/forum/admin-report', async (_req, res) => {
  try {
    const getRes = await fetch(CLOUD_DB_URL);
    if (getRes.ok) {
      const currentObj: any = await getRes.json();
      const data = currentObj.data || { members: [], verifications: [] };
      return res.json({
        totalNewMembers: Array.isArray(data.members) ? data.members.length : 0,
        totalVerifications: Array.isArray(data.verifications) ? data.verifications.length : 0,
        members: data.members || [],
        verifications: data.verifications || []
      });
    }
    res.json({ totalNewMembers: 0, totalVerifications: 0, members: [], verifications: [] });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// ========================================================
// HỆ THỐNG KẾT NỐI BIẾN ĐỘNG SỐ DƯ SEPAY (MBBANK) & DUYỆT HẠN MỨC TỰ ĐỘNG
// Tài khoản MBBank: 0906998966 - NGUYEN TIEN DUNG
// Cú pháp chuyển khoản: 
// - Gói Tháng (45k): "forumM [Mã Đơn]" (VD: forumM CP8392)
// - Gói 1 Năm (450k): "Forum (M) [Mã Đơn]" (VD: Forum (M) CP8392)
// - Gói 3 Năm (1.120k - Giảm 17%): "forum3Y [Mã Đơn]" hoặc "Forum 3(M) [Mã Đơn]"
// Hạn mức: >= 45.000đ -> Duyệt 1 Tháng | >= 450.000đ -> Duyệt 1 Năm | >= 1.120.000đ -> Duyệt 3 Năm
// ========================================================
interface PaidTransaction {
  orderCode: string;
  amount: number;
  plan: 'month' | 'year' | '3year';
  activationCode: string;
  sender?: string;
  transactionDate: string;
  timestamp: number;
}

const PAID_TRANSACTIONS: Record<string, PaidTransaction> = {};

// Webhook xử lý biến động số dư từ SePay (hỗ trợ cả MBBank, Vietcombank, Casso...)
const handlePaymentWebhook = async (req: any, res: any) => {
  try {
    const body = req.body || {};
    // Chuẩn hóa dữ liệu từ các cổng SePay Webhook / Open Banking
    const rawAmount = Number(body.amount || body.transferAmount || body.creditAmount || 0);
    const content = String(body.content || body.description || body.subAccount || body.orderCode || '').toUpperCase();
    const sender = String(body.senderName || body.correspName || body.accountNumber || 'MBBank User');

    if (rawAmount < 45000) {
      return res.status(400).json({
        error: 'Số tiền nhỏ hơn hạn mức tối thiểu 45.000đ của CLB'
      });
    }

    // Tự động phân loại hạn mức: >= 1.120k -> 3 Năm (giảm 17%), >= 450k -> 1 Năm (tặng 2 tháng), >= 45k -> 1 Tháng
    let plan: 'month' | 'year' | '3year' = 'month';
    if (rawAmount >= 1120000 || content.includes('FORUM3Y') || content.includes('FORUM 3Y') || content.includes('FORUM 3(M)')) {
      plan = '3year';
    } else if (rawAmount >= 450000 || content.includes('FORUM (M)') || content.includes('FORUM(M)') || content.includes('FORUMY')) {
      plan = 'year';
    } else {
      plan = 'month';
    }

    // Trích xuất mã đơn dạng CPxxxx hoặc FORUM xxxx trong nội dung chuyển khoản
    let matchedOrderCode = '';
    const cpMatch = content.match(/CP\d{4}/);
    if (cpMatch) {
      matchedOrderCode = cpMatch[0];
    } else {
      const forumMatch = content.match(/FORUM(?:M|\s*\(M\)|\s*\(?3M\)?|3Y)?\s*(\w+)/);
      if (forumMatch && forumMatch[1]) {
        matchedOrderCode = forumMatch[1];
      } else {
        matchedOrderCode = 'GLOBAL_' + Date.now();
      }
    }

    const activationCode = `VIP-${plan.toUpperCase()}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;

    const planLabel = plan === '3year' ? '3 Năm (Giảm 17%)' : (plan === 'year' ? '1 Năm' : '1 Tháng');

    const paidRecord: PaidTransaction = {
      orderCode: matchedOrderCode,
      amount: rawAmount,
      plan,
      activationCode,
      sender,
      transactionDate: new Date().toLocaleString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh' }),
      timestamp: Date.now()
    };

    PAID_TRANSACTIONS[matchedOrderCode] = paidRecord;

    // Gửi thông báo tức thì về ntfy và Cloud DB để đối soát
    fetch(NTFY_LOG_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type: 'MBBANK_PAYMENT_APPROVED',
        title: `💰 MBBank (SePay) Tự Động Duyệt Gói ${planLabel} (${rawAmount.toLocaleString('vi-VN')}đ)`,
        ...paidRecord
      })
    }).catch(() => {});

    res.json({
      success: true,
      message: `Đã duyệt tự động hạn mức gói ${planLabel} thành công!`,
      paidRecord
    });
  } catch (err: any) {
    console.error('Lỗi SePay Webhook:', err);
    res.status(500).json({ error: err.message || 'Lỗi xử lý Webhook SePay' });
  }
};

app.post('/api/forum/payment/sepay-webhook', handlePaymentWebhook);
app.post('/api/forum/payment/vcb-webhook', handlePaymentWebhook);

// Endpoint kiểm tra giao dịch thực tế từ tài khoản MBBank qua SePay (chặn 100% người bấm khống)
app.get('/api/forum/payment/check-status', (req, res) => {
  const code = String(req.query.code || req.query.orderCode || '').trim().toUpperCase();
  if (!code) {
    return res.status(400).json({ paid: false, message: 'Thiếu mã đơn hàng' });
  }

  // Tìm trong danh sách giao dịch đã thực sự được ngân hàng xác nhận
  const found = PAID_TRANSACTIONS[code];
  if (found) {
    const planDurationLabel = 
      found.plan === '3year' 
        ? '3 Năm (1.095 ngày - Giảm 17%)' 
        : (found.plan === 'year' ? '1 Năm (365 ngày)' : '1 Tháng (30 ngày)');
    return res.json({
      paid: true,
      message: `Đã xác thực giao dịch thành công từ MBBank (SePay)! Tự động duyệt gói ${planDurationLabel}.`,
      plan: found.plan,
      activationCode: found.activationCode,
      amount: found.amount,
      approvedAt: found.transactionDate
    });
  }

  return res.json({
    paid: false,
    message: `Hệ thống kiểm tra tài khoản MBBank 0906998966 chưa nhận được số tiền với nội dung chứa mã "${code}". Quý khách vui lòng hoàn tất chuyển khoản trong ứng dụng ngân hàng rồi kiểm tra lại nhé!`
  });
});

export default app;
