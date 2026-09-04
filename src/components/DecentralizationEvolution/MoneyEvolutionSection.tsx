import React, { useState } from 'react';
import {
  Coins,
  ArrowRight,
  ShieldAlert,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Sparkles,
  Layers,
  Scale,
  Zap,
  HelpCircle,
  Building,
  CreditCard,
  History,
  TrendingUp,
  Cpu,
} from 'lucide-react';
import { useLanguage } from '../../i18n/LanguageContext';
import { MoneyEra } from './types';

interface MoneyEvolutionSectionProps {
  onInteracted?: () => void;
  onNextStage?: () => void;
  isHandsOn?: boolean;
}

const MONEY_ERAS: MoneyEra[] = [
  {
    id: 'barter',
    name: { vi: 'Hàng Đổi Hàng', en: 'Barter System' },
    era: { vi: 'Thời Cổ Đại (9000 TCN)', en: 'Ancient Eras (9000 BC)' },
    iconName: 'Scale',
    problem: {
      vi: 'Trùng hợp nhu cầu kép: Bạn có lúa mì muốn đổi bò, nhưng người có bò lại chỉ cần muối. Không có mẫu số chung để định giá.',
      en: 'Double coincidence of wants: You have wheat and want a cow, but the cow owner wants salt. No common denominator of value.',
    },
    improvement: {
      vi: 'Trao đổi trực tiếp vật phẩm có giá trị sử dụng nội tại (thóc, bò, rìu, vỏ sò).',
      en: 'Direct exchange of commodities with intrinsic utility (grains, cattle, shells).',
    },
    newTrustAssumption: {
      vi: 'Tin tưởng vào chất lượng và tình trạng sử dụng tức thời của món hàng đối phương.',
      en: 'Trusting the immediate physical quality of the counterparty item.',
    },
    limitation: {
      vi: '❌ Khó chia nhỏ, hư hỏng theo thời gian, cồng kềnh khó vận chuyển đi xa.',
      en: '❌ Perishable, indivisible for small trades, heavy to transport over distances.',
    },
    criteriaScores: {
      portable: false,
      durable: false,
      divisible: false,
      limitedSupply: false,
    },
  },
  {
    id: 'gold',
    name: { vi: 'Vàng & Kim Loại Quý', en: 'Gold & Precious Metals' },
    era: { vi: '600 TCN - Thế kỷ 17', en: '600 BC - 17th Century' },
    iconName: 'Coins',
    problem: {
      vi: 'Hàng hóa thông thường dễ ôi thiu và mất giá trị theo mùa vụ.',
      en: 'Commodity goods degrade and lose value across seasons.',
    },
    improvement: {
      vi: 'Độ bền vĩnh cửu, không bị oxy hóa, nguồn cung tự nhiên giới hạn bởi chi phí khai thác.',
      en: 'Eternal durability, non-perishable, naturally limited supply bound by mining cost.',
    },
    newTrustAssumption: {
      vi: 'Tin tưởng vào độ tinh khiết và trọng lượng của kim loại (cần kiểm định/cân đo).',
      en: 'Trusting purity and weight verification of the bullion/coin.',
    },
    limitation: {
      vi: '❌ Rất nặng khi mang số lượng lớn đi buôn bán đường dài; rủi ro bị cướp bóc cao.',
      en: '❌ Extremely heavy and dangerous to transport; high risk of physical theft.',
    },
    criteriaScores: {
      portable: false,
      durable: true,
      divisible: true,
      limitedSupply: true,
    },
  },
  {
    id: 'gold_certificates',
    name: { vi: 'Chứng Chỉ Vàng (Tiền Giấy Sơ Khai)', en: 'Gold Certificates' },
    era: { vi: 'Thế kỷ 17 - 19 (Goldsmiths)', en: '17th - 19th Century (Goldsmiths)' },
    iconName: 'Building',
    problem: {
      vi: 'Vận chuyển vàng thỏi cồng kềnh và nguy hiểm trong các chuyến thương mại lớn.',
      en: 'Transporting heavy gold bars was dangerous for merchants.',
    },
    improvement: {
      vi: 'Thương nhân gửi vàng vào két của thợ kim hoàn và nhận giấy biên nhận gọn nhẹ để thanh toán.',
      en: 'Merchants deposited gold with goldsmiths and traded lightweight paper receipts.',
    },
    newTrustAssumption: {
      vi: '⚠ Bắt buộc phải tin tưởng tuyệt đối vào thợ kim hoàn (người giữ vàng) không lừa đảo hoặc in khống.',
      en: '⚠ Requires absolute trust in the goldsmith/custodian not to issue unbacked paper.',
    },
    limitation: {
      vi: '❌ Thợ kim hoàn có thể lén lút in nhiều giấy hơn lượng vàng thực có trong két (Fractional Reserve).',
      en: '❌ The custodian can covertly over-issue paper claims beyond actual vault gold.',
    },
    criteriaScores: {
      portable: true,
      durable: false,
      divisible: true,
      limitedSupply: false,
    },
  },
  {
    id: 'banking',
    name: { vi: 'Hệ Thống Tiền Pháp Định (Fiat/Banking)', en: 'Centralized Fiat & Banking' },
    era: { vi: 'Thế kỷ 20 - Hiện nay', en: '20th Century - Present' },
    iconName: 'CreditCard',
    problem: {
      vi: 'Tiền giấy tư nhân thiếu chuẩn hóa quốc gia và hay sụp đổ khi người dân rút vàng ồ ạt.',
      en: 'Private banknotes lacked national standards and caused panics during bank runs.',
    },
    improvement: {
      vi: 'Ngân hàng Trung ương độc quyền phát hành tiền pháp định, luật pháp đảm bảo lưu thông.',
      en: 'Central Banks monopoly on legal tender, backed by state power and legal mandate.',
    },
    newTrustAssumption: {
      vi: 'Tin tưởng vào chính phủ và ngân hàng trung ương không in tiền quá mức gây lạm phát.',
      en: 'Trust in central bank monetary policy and government solvency against inflation.',
    },
    limitation: {
      vi: '❌ Rủi ro lạm phát do tăng cung tiền tùy ý; kiểm soát tập trung có thể phong tỏa tài khoản.',
      en: '❌ Inflation risk through arbitrary supply expansion; single entities can freeze funds.',
    },
    criteriaScores: {
      portable: true,
      durable: true,
      divisible: true,
      limitedSupply: false,
    },
  },
  {
    id: 'digital_money',
    name: { vi: 'Tiền Kỹ Thuật Số Tập Trung', en: 'Centralized Digital Money' },
    era: { vi: 'Kỷ Nguyên Internet (1990 - Nay)', en: 'Internet Era (1990 - Present)' },
    iconName: 'Zap',
    problem: {
      vi: 'Tiền mặt giấy không thể truyền gửi qua dây cáp Internet hay mua hàng toàn cầu tức thì.',
      en: 'Physical cash cannot be wired across internet cables for instant global commerce.',
    },
    improvement: {
      vi: 'Chuyển đổi số thành các bản ghi trong cơ sở dữ liệu SQL của ngân hàng (Visa, PayPal, Banking App).',
      en: 'Digitized entries in central bank databases (Visa, PayPal, online banking apps).',
    },
    newTrustAssumption: {
      vi: 'Phải tin tưởng hoàn toàn vào máy chủ trung tâm (Server của ngân hàng) không bị hack hay sập.',
      en: 'Must trust the central database operator not to be hacked, corrupted, or censored.',
    },
    limitation: {
      vi: '❌ Điểm yếu chí tử: Single Point of Failure, phí trung gian cao, vấn đề Tiêu Đúp nếu thiếu máy chủ.',
      en: '❌ Single point of failure, high intermediary fees, susceptible to double-spending without server.',
    },
    criteriaScores: {
      portable: true,
      durable: true,
      divisible: true,
      limitedSupply: false,
    },
  },
  {
    id: 'bitcoin',
    name: { vi: 'Bitcoin & Tiền Kỹ Thuật Số Phi Tập Trung', en: 'Bitcoin / Decentralized Money' },
    era: { vi: '2008 - Tương Lai', en: '2008 - Future' },
    iconName: 'Cpu',
    problem: {
      vi: 'Mọi hình thức tiền kỹ thuật số trước đây đều phải phụ thuộc vào một máy chủ trung tâm đáng tin cậy.',
      en: 'Every previous digital cash required an authoritative trusted central server.',
    },
    improvement: {
      vi: 'Tiền kỹ thuật số ngang hàng (Peer-to-Peer): Tự sở hữu qua chữ ký mật mã, nguồn cung cố định 21 triệu.',
      en: 'Peer-to-peer electronic cash: cryptographic self-sovereignty, mathematically capped 21M supply.',
    },
    newTrustAssumption: {
      vi: 'Không cần tin con người/tổ chức trung gian — Chỉ cần tin vào Toán học, Mật mã học & Quy tắc Đồng thuận.',
      en: 'No human/institution trust required — Trust is placed in Math, Cryptography & Consensus rules.',
    },
    limitation: {
      vi: 'Yêu cầu người dùng tự chịu trách nhiệm bảo vệ Khóa Riêng Tư (Private Key); không có tổng đài hoàn tiền.',
      en: 'Users must secure their own private keys; irreversible transactions with no central helpdesk.',
    },
    criteriaScores: {
      portable: true,
      durable: true,
      divisible: true,
      limitedSupply: true,
    },
  },
];

export const MoneyEvolutionSection: React.FC<MoneyEvolutionSectionProps> = ({
  onInteracted,
  onNextStage,
  isHandsOn = false,
}) => {
  const { language } = useLanguage();
  const [selectedEraIndex, setSelectedEraIndex] = useState<number>(1); // default to Gold (02)
  const [testedAsset, setTestedAsset] = useState<'gold' | 'paper' | 'fiat_digital' | 'bitcoin'>('gold');

  const selectedEra = MONEY_ERAS[selectedEraIndex];

  // Map timeline stage index to corresponding tested asset
  const ERA_TO_ASSET_MAP: Record<number, 'gold' | 'paper' | 'fiat_digital' | 'bitcoin'> = {
    0: 'gold', // 01. Hàng đổi hàng -> defaults to gold
    1: 'gold', // 02. Vàng & Kim loại quý -> Vàng thỏi
    2: 'gold', // 03. Chứng chỉ vàng -> Vàng thỏi
    3: 'paper', // 04. Hệ thống tiền pháp định -> Tiền giấy
    4: 'fiat_digital', // 05. Tiền kỹ thuật số tập trung -> Tiền ngân hàng số
    5: 'bitcoin', // 06. Bitcoin -> Bitcoin
  };

  const handleSelectEra = (idx: number) => {
    setSelectedEraIndex(idx);
    const mappedAsset = ERA_TO_ASSET_MAP[idx];
    if (mappedAsset) {
      setTestedAsset(mappedAsset);
    }
    onInteracted?.();
  };

  const handleSelectAsset = (assetId: 'gold' | 'paper' | 'fiat_digital' | 'bitcoin') => {
    setTestedAsset(assetId);
    onInteracted?.();
  };

  const assetCriteriaDetails = {
    gold: {
      title: { vi: 'Vàng thỏi', en: 'Gold Bullion' },
      portable: {
        pass: false,
        desc: {
          vi: 'Nặng và cồng kềnh, khó vận chuyển khi giao dịch với số lượng lớn.',
          en: 'Heavy and bulky, difficult to transport for large-scale transactions.',
        },
      },
      durable: {
        pass: true,
        desc: {
          vi: 'Không dễ bị ăn mòn hoặc biến chất theo thời gian.',
          en: 'Highly resistant to corrosion, decay, or degradation over time.',
        },
      },
      divisible: {
        pass: true,
        desc: {
          vi: 'Có thể nấu chảy và chia thành các đơn vị nhỏ hơn.',
          en: 'Can be melted and divided into smaller standardized units.',
        },
      },
      limitedSupply: {
        pass: true,
        desc: {
          vi: 'Nguồn cung tự nhiên hữu hạn và chi phí khai thác cao.',
          en: 'Naturally scarce supply with high extraction costs.',
        },
      },
    },
    paper: {
      title: { vi: 'Tiền giấy', en: 'Banknotes' },
      portable: {
        pass: true,
        desc: {
          vi: 'Nhẹ, gọn và thuận tiện cho việc trao đổi trực tiếp.',
          en: 'Light, compact, and convenient for direct in-person exchange.',
        },
      },
      durable: {
        pass: false,
        desc: {
          vi: 'Dễ rách, ẩm mốc, cháy và hao mòn theo thời gian.',
          en: 'Prone to tearing, moisture, fire damage, and physical wear over time.',
        },
      },
      divisible: {
        pass: true,
        desc: {
          vi: 'Có nhiều mệnh giá khác nhau để sử dụng trong giao dịch.',
          en: 'Issued in various fractional denominations for daily transactions.',
        },
      },
      limitedSupply: {
        pass: false,
        desc: {
          vi: 'Nguồn cung có thể được mở rộng theo chính sách tiền tệ.',
          en: 'Supply can be centrally expanded according to monetary policy.',
        },
      },
    },
    fiat_digital: {
      title: { vi: 'Tiền ngân hàng số', en: 'Digital Bank Money' },
      portable: {
        pass: true,
        desc: {
          vi: 'Có thể chuyển giao nhanh chóng thông qua hệ thống mạng.',
          en: 'Transferred instantaneously across global digital network infrastructure.',
        },
      },
      durable: {
        pass: true,
        desc: {
          vi: 'Không bị hao mòn vật lý và được lưu trữ dưới dạng dữ liệu.',
          en: 'Immune to physical wear and maintained as persistent digital database records.',
        },
      },
      divisible: {
        pass: true,
        desc: {
          vi: 'Có thể ghi nhận và chuyển giao với độ chính xác cao.',
          en: 'Recorded and transferred with high fractional decimal precision.',
        },
      },
      limitedSupply: {
        pass: false,
        desc: {
          vi: 'Phụ thuộc vào chính sách tiền tệ và cơ chế tạo tiền của hệ thống ngân hàng.',
          en: 'Subject to central bank monetary policy and commercial banking credit creation.',
        },
      },
    },
    bitcoin: {
      title: { vi: 'Bitcoin', en: 'Bitcoin' },
      portable: {
        pass: true,
        desc: {
          vi: 'Có thể chuyển giao xuyên biên giới thông qua mạng lưới Internet.',
          en: 'Transferred borderlessly across the Internet.',
        },
      },
      durable: {
        pass: true,
        desc: {
          vi: 'Không bị hao mòn vật lý; quyền sở hữu được ghi nhận trên sổ cái phân tán.',
          en: 'Immune to physical wear; ownership is cryptographically recorded on a distributed ledger.',
        },
      },
      divisible: {
        pass: true,
        desc: {
          vi: 'Có thể chia nhỏ đến 8 chữ số thập phân; 1 BTC = 100.000.000 satoshi.',
          en: 'Divisible down to 8 decimal places; 1 BTC = 100,000,000 satoshis.',
        },
      },
      limitedSupply: {
        pass: true,
        desc: {
          vi: 'Tổng nguồn cung được giới hạn ở 21 triệu BTC theo giao thức.',
          en: 'Total supply is mathematically capped at 21 million BTC by consensus protocol.',
        },
      },
    },
  };

  const activeTest = assetCriteriaDetails[testedAsset];

  return (
    <div className="space-y-6">
      {/* Main Container */}
      <div className="p-5 sm:p-6 rounded-xl bg-zinc-950/80 border border-zinc-800 shadow-sm space-y-6">
        {/* Header Block */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-zinc-800">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-xs font-mono text-zinc-400">
              <span className="text-emerald-400">Phần 01</span>
              <span className="text-zinc-600">·</span>
              <span>{language === 'vi' ? 'Sự Tiến Hóa Tiền Tệ' : 'Money Evolution'}</span>
            </div>
            <h3 className="text-lg sm:text-xl font-bold text-zinc-100 tracking-tight">
              {language === 'vi'
                ? 'Tại sao hình thái tiền tệ luôn phải thay đổi?'
                : 'Why Has Money Constantly Evolved Over History?'}
            </h3>
            <p className="text-xs sm:text-sm text-zinc-400 max-w-3xl leading-relaxed">
              {language === 'vi'
                ? 'Tiền tệ không phải là một phát minh tĩnh. Mỗi khi một hình thái tiền tệ ra đời để giải quyết hạn chế của hình thái cũ, nó lại vô tình tạo ra một "Giả định niềm tin mới" — cho đến khi niềm tin đó bị lạm dụng và dẫn tới khủng hoảng.'
                : 'Money is an evolving technology. Whenever a new form solved an old limitation, it introduced a new trust assumption — until that trust was exploited.'}
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs font-mono text-zinc-400 shrink-0 self-start md:self-center">
            <span>{selectedEraIndex + 1} / {MONEY_ERAS.length}</span>
          </div>
        </div>

        {/* 6-Era Horizontal Progression Timeline (Linear/Vercel style, scrollable, no truncate) */}
        <div>
          <nav
            className="flex items-center gap-1 sm:gap-2 overflow-x-auto no-scrollbar py-1"
            aria-label="Money Evolution Timeline"
          >
            {MONEY_ERAS.map((era, idx) => {
              const isSelected = selectedEraIndex === idx;
              const eraName = era.name[language];
              const eraPeriod = era.era[language];

              return (
                <button
                  key={era.id}
                  type="button"
                  onClick={() => handleSelectEra(idx)}
                  className={`group relative flex items-center gap-2 px-3 py-2 rounded-md text-xs font-medium transition-colors whitespace-nowrap cursor-pointer shrink-0 ${
                    isSelected
                      ? 'bg-zinc-900 text-zinc-100 font-semibold'
                      : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/50'
                  }`}
                >
                  <span
                    className={`font-mono text-[11px] px-1.5 py-0.5 rounded transition-colors ${
                      isSelected
                        ? 'bg-emerald-500/20 text-emerald-400 font-bold'
                        : 'bg-zinc-900 text-zinc-500 group-hover:text-zinc-400'
                    }`}
                  >
                    0{idx + 1}
                  </span>

                  <span className="tracking-tight">{eraName}</span>

                  <span className="text-[10px] font-mono text-zinc-500 ml-0.5 hidden sm:inline">
                    {era.id === 'bitcoin' ? '2008+' : era.id === 'barter' ? '9000 TCN' : ''}
                  </span>

                  {isSelected && (
                    <span
                      className="absolute bottom-0 left-2 right-2 h-0.5 bg-emerald-400 rounded-full"
                      aria-hidden="true"
                    />
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Deep Dive Content: Two Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 pt-2">
          {/* Left Column: 4 Evolution Dimensions */}
          <div className="lg:col-span-7 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-zinc-800/80">
              <div className="flex items-center gap-2">
                <span className="px-1.5 py-0.5 rounded bg-zinc-900 text-emerald-400 font-mono text-xs font-semibold">
                  0{selectedEraIndex + 1}
                </span>
                <h4 className="text-sm sm:text-base font-semibold text-zinc-100">
                  {selectedEra.name[language]}
                </h4>
              </div>
              <span className="text-xs font-mono text-zinc-400">{selectedEra.era[language]}</span>
            </div>

            <div className="space-y-2.5">
              {/* 1. Problem */}
              <div className="p-3.5 rounded-lg bg-zinc-900/60 border-l-2 border-rose-500/70 space-y-1">
                <div className="flex items-center gap-1.5 text-rose-400 text-xs font-medium">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  <span>{language === 'vi' ? 'Vấn đề tồn tại lúc đó' : 'Existing Problem'}</span>
                </div>
                <p className="text-xs text-zinc-300 leading-relaxed">{selectedEra.problem[language]}</p>
              </div>

              {/* 2. Improvement */}
              <div className="p-3.5 rounded-lg bg-zinc-900/60 border border-border-primary space-y-1">
                <div className="flex items-center gap-1.5 text-emerald-400 text-xs font-medium">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>{language === 'vi' ? 'Cải tiến đạt được' : 'What Improved'}</span>
                </div>
                <p className="text-xs text-zinc-300 leading-relaxed">{selectedEra.improvement[language]}</p>
              </div>

              {/* 3. New Trust Assumption */}
              <div className="p-3.5 rounded-lg bg-zinc-900/60 border-l-2 border-amber-500/70 space-y-1">
                <div className="flex items-center gap-1.5 text-amber-400 text-xs font-medium">
                  <ShieldAlert className="w-3.5 h-3.5" />
                  <span>{language === 'vi' ? 'Giả định niềm tin mới xuất hiện' : 'New Trust Assumption'}</span>
                </div>
                <p className="text-xs text-zinc-300 leading-relaxed">{selectedEra.newTrustAssumption[language]}</p>
              </div>

              {/* 4. Remaining Limitation */}
              <div className="p-3.5 rounded-lg bg-zinc-900/60 border-l-2 border-zinc-600 space-y-1">
                <div className="flex items-center gap-1.5 text-zinc-400 text-xs font-medium">
                  <XCircle className="w-3.5 h-3.5 text-zinc-400" />
                  <span>{language === 'vi' ? 'Hạn chế còn tồn đọng' : 'Remaining Limitation'}</span>
                </div>
                <p className="text-xs text-zinc-300 leading-relaxed">{selectedEra.limitation[language]}</p>
              </div>
            </div>

            <div className="flex items-center justify-between pt-2">
              <button
                type="button"
                disabled={selectedEraIndex === 0}
                onClick={() => handleSelectEra(selectedEraIndex - 1)}
                className="px-3 py-1.5 rounded-md bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-xs font-medium text-zinc-300 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-colors"
              >
                {language === 'vi' ? '← Mốc trước' : '← Previous Era'}
              </button>
              <button
                type="button"
                disabled={selectedEraIndex === MONEY_ERAS.length - 1}
                onClick={() => handleSelectEra(selectedEraIndex + 1)}
 className="px-3 py-1.5 rounded-md bg-text-primary hover:bg-white/90 text-bg-primary font-semibold font-semibold text-xs disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-colors"
              >
                {language === 'vi' ? 'Mốc tiếp theo →' : 'Next Era →'}
              </button>
            </div>
          </div>

          {/* Right Column: MONEY QUALITY TEST (4 Criteria Lab) */}
          <div className="lg:col-span-5 p-4 sm:p-5 rounded-lg bg-zinc-900/40 border border-zinc-800 flex flex-col justify-between space-y-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-zinc-200">
                  <Scale className="w-3.5 h-3.5 text-text-muted" />
                  <span>{language === 'vi' ? 'Thí nghiệm đánh giá tiền tệ' : 'Money Quality Test'}</span>
                </div>
                <span className="text-xs text-zinc-400 font-mono">
                  {language === 'vi' ? '4 tiêu chí' : '4 criteria'}
                </span>
              </div>

              {/* Asset Selector Tabs: Minimal Segmented Control / Grid */}
              <div className="grid grid-cols-2 gap-1.5">
                {(
                  [
                    { id: 'gold', label: { vi: 'Vàng thỏi', en: 'Gold Bullion' } },
                    { id: 'paper', label: { vi: 'Tiền giấy', en: 'Banknotes' } },
                    { id: 'fiat_digital', label: { vi: 'Tiền ngân hàng số', en: 'Digital Bank Money' } },
                    { id: 'bitcoin', label: { vi: 'Bitcoin', en: 'Bitcoin' } },
                  ] as const
                ).map((tab) => (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => handleSelectAsset(tab.id)}
                    className={`px-2.5 py-1.5 rounded-md text-xs font-medium transition-colors cursor-pointer text-center whitespace-nowrap ${
                      testedAsset === tab.id
                        ? 'bg-zinc-800 text-emerald-400 font-semibold shadow-sm border border-zinc-700/60'
                        : 'bg-zinc-900/80 text-zinc-400 hover:text-zinc-200 border border-transparent'
                    }`}
                  >
                    {tab.label[language]}
                  </button>
                ))}
              </div>

              {/* Contextual notice for Gold Certificate era */}
              {selectedEraIndex === 2 && testedAsset === 'gold' && (
                <p className="text-[11px] text-zinc-400/90 leading-relaxed pt-0.5">
                  {language === 'vi'
                    ? 'Ghi chú: Chứng chỉ vàng trong giai đoạn này được bảo chứng tương đương bằng vàng thỏi lưu ký.'
                    : 'Note: Gold receipts in this era were backed 1:1 by deposited physical gold bullion.'}
                </p>
              )}
            </div>

            {/* 4 Criteria Visual Matrix */}
            <div className="space-y-2 transition-all duration-200">
              {/* 1. Portable */}
              <div className="p-2.5 rounded-md bg-zinc-900/70 border border-zinc-800/80 flex items-start justify-between gap-3">
                <div className="space-y-0.5">
                  <div className="text-xs font-medium text-zinc-200">
                    <span>{language === 'vi' ? '1. Tính dễ vận chuyển' : '1. Portability'}</span>
                  </div>
                  <p className="text-[11px] text-zinc-400 leading-snug">{activeTest.portable.desc[language]}</p>
                </div>
                <div className="shrink-0 pt-0.5">
                  {activeTest.portable.pass ? (
                    <CheckCircle2 className="w-4 h-4 text-success" />
                  ) : (
                    <XCircle className="w-4 h-4 text-rose-400" />
                  )}
                </div>
              </div>

              {/* 2. Durable */}
              <div className="p-2.5 rounded-md bg-zinc-900/70 border border-zinc-800/80 flex items-start justify-between gap-3">
                <div className="space-y-0.5">
                  <div className="text-xs font-medium text-zinc-200">
                    <span>{language === 'vi' ? '2. Tính bền vững' : '2. Durability'}</span>
                  </div>
                  <p className="text-[11px] text-zinc-400 leading-snug">{activeTest.durable.desc[language]}</p>
                </div>
                <div className="shrink-0 pt-0.5">
                  {activeTest.durable.pass ? (
                    <CheckCircle2 className="w-4 h-4 text-success" />
                  ) : (
                    <XCircle className="w-4 h-4 text-rose-400" />
                  )}
                </div>
              </div>

              {/* 3. Divisible */}
              <div className="p-2.5 rounded-md bg-zinc-900/70 border border-zinc-800/80 flex items-start justify-between gap-3">
                <div className="space-y-0.5">
                  <div className="text-xs font-medium text-zinc-200">
                    <span>{language === 'vi' ? '3. Tính dễ chia nhỏ' : '3. Divisibility'}</span>
                  </div>
                  <p className="text-[11px] text-zinc-400 leading-snug">{activeTest.divisible.desc[language]}</p>
                </div>
                <div className="shrink-0 pt-0.5">
                  {activeTest.divisible.pass ? (
                    <CheckCircle2 className="w-4 h-4 text-success" />
                  ) : (
                    <XCircle className="w-4 h-4 text-rose-400" />
                  )}
                </div>
              </div>

              {/* 4. Limited Supply */}
              <div className="p-2.5 rounded-md bg-zinc-900/70 border border-zinc-800/80 flex items-start justify-between gap-3">
                <div className="space-y-0.5">
                  <div className="text-xs font-medium text-zinc-200">
                    <span>{language === 'vi' ? '4. Tính khan hiếm' : '4. Scarcity'}</span>
                  </div>
                  <p className="text-[11px] text-zinc-400 leading-snug">{activeTest.limitedSupply.desc[language]}</p>
                </div>
                <div className="shrink-0 pt-0.5">
                  {activeTest.limitedSupply.pass ? (
                    <CheckCircle2 className="w-4 h-4 text-success" />
                  ) : (
                    <XCircle className="w-4 h-4 text-rose-400" />
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Next Step Bridge CTA */}
      {onNextStage && (
        <div className="flex justify-end pt-2">
          <button
            type="button"
            onClick={onNextStage}
 className="px-4 py-2 rounded-lg bg-text-primary hover:bg-white/90 text-bg-primary font-semibold font-semibold text-xs flex items-center gap-2 transition-colors cursor-pointer shadow-sm"
          >
            <span>{language === 'vi' ? 'Khám phá Phần 02: Nghịch Lý Niềm Tin →' : 'Next: Part 02 - The Trust Paradox →'}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}
    </div>
  );
};
