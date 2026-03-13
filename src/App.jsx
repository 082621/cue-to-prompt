import React, { useState } from 'react';
import {
  Check,
  Copy,
  MessageCircle,
  ArrowRight,
  Layout,
  Users,
  Compass,
  Home,
  BookOpen,
  Heart,
  Sparkles,
} from 'lucide-react';

// --- 数据配置 ---
const CONCERNS_CONFIG = [
  {
    id: 'academic',
    title: '学业压力',
    desc: '截止日期、成绩、进度、专注困难',
    icon: <BookOpen className="w-5 h-5" />,
    cues: ['截止日期都堆在一起', '感觉自己进度落后', '学业任务太多', '考试 / 成绩压力大', '很难专心', '担心自己表现不够好'],
  },
  {
    id: 'future',
    title: '未来规划不确定',
    desc: '毕业去向、求职、方向选择',
    icon: <Compass className="w-5 h-5" />,
    cues: ['不知道毕业后要做什么', '害怕自己选错方向', '对找工作很焦虑', '没有明确方向', '总在和别人比较', '对下一步感到卡住了'],
  },
  {
    id: 'family',
    title: '家庭期待',
    desc: '家人压力、解释困难、害怕辜负',
    icon: <Home className="w-5 h-5" />,
    cues: ['担心让家人失望', '很难和家里解释我现在的情况', '感到来自家庭的压力', '对未来选择有很强的家庭期待', '会因为达不到期待而内疚', '家人的期待压得我有点喘'],
  },
  {
    id: 'social',
    title: '人际关系 / 孤独感',
    desc: '孤独、关系摩擦、缺乏支持',
    icon: <Users className="w-5 h-5" />,
    cues: ['感觉自己很孤单', '很难建立真正亲近的关系', '感觉没有人真正理解我', '和朋友 / 室友之间有摩擦', '很想要情感支持', '即使身边有人，也还是觉得孤单'],
  },
  {
    id: 'culture',
    title: '文化适应压力',
    desc: '语言、归属感、持续适应的疲惫',
    icon: <Sparkles className="w-5 h-5" />,
    cues: ['语言沟通有压力', '总觉得自己不完全属于这里', '一直在适应新的环境，感觉很累', '不同的社交规则让我有压力', '感觉夹在两种文化之间', '在这个环境里很难自然表达自己'],
  },
];

const EMOTIONS = ['焦虑', '压力大', '孤独', '迷茫', '内疚', '烦躁', '很累', '卡住了', '委屈', '情绪很绷'];

const IMPACTS = [
  '很难专心',
  '总在反复想这件事',
  '很难做决定',
  '情绪一直绷着',
  '影响了日常生活',
  '我不知道从哪里开始',
  '让我更难和别人沟通',
  '让我一直觉得很累',
  '很难真正放松下来',
  '我有点不想面对它',
];

const SUPPORT_NEEDS = ['情绪安慰', '实际建议', '帮我整理思路', '鼓励和支持', '帮我理清下一步怎么做', '只是想被认真听一听'];

const RESPONSE_STYLES = ['温柔一点', '更具体一点', '一步一步地帮我分析', '简洁直接', '更像陪我理清思路', '不要太空泛'];

// --- 子组件：进度条 ---
const ProgressBar = ({ current, total }) => {
  const progress = (current / total) * 100;
  return (
    <div className="w-full h-1 bg-[#E7ECE3] rounded-full overflow-hidden mb-8">
      <div
        className="h-full bg-[#A7C4A0] transition-all duration-500 ease-out"
        style={{ width: `${progress}%` }}
      />
    </div>
  );
};

// --- 主应用 ---
export default function App() {
  const [step, setStep] = useState(0); // 0 to 7
  const [selectedConcerns, setSelectedConcerns] = useState([]);
  const [concernData, setConcernData] = useState({});
  const [supportNeeds, setSupportNeeds] = useState([]);
  const [responseStyle, setResponseStyle] = useState('');
  const [optionalText, setOptionalText] = useState('');
  const [showCopyFeedback, setShowCopyFeedback] = useState(false);

  const concernStepIndex = step >= 2 && step <= 4 ? step - 2 : null;
  const currentConcern =
    concernStepIndex !== null
      ? CONCERNS_CONFIG.find((c) => c.id === selectedConcerns[concernStepIndex])
      : null;

  const handleNext = () => setStep((s) => s + 1);
  const handleBack = () => setStep((s) => s - 1);

  const toggleConcern = (id) => {
    if (selectedConcerns.includes(id)) {
      setSelectedConcerns(selectedConcerns.filter((i) => i !== id));
    } else if (selectedConcerns.length < 3) {
      setSelectedConcerns([...selectedConcerns, id]);
    }
  };

  const updateConcernData = (id, field, value) => {
    setConcernData((prev) => ({
      ...prev,
      [id]: {
        ...(prev[id] || {
          cues: [],
          emotions: [],
          impacts: [],
          customCue: '',
          customEmotion: '',
          customImpact: '',
        }),
        [field]: value,
      },
    }));
  };

  const isConcernComplete = (id) => {
    const data = concernData[id];
    if (!data) return false;

    const hasCue = data.cues?.length > 0 || data.customCue?.trim();
    const hasEmotion = data.emotions?.length > 0 || data.customEmotion?.trim();
    const hasImpact = data.impacts?.length > 0 || data.customImpact?.trim();

    return hasCue && hasEmotion && hasImpact;
  };

  const generatePrompt = () => {
    if (!selectedConcerns.length) return '';

    const allEmotions = Array.from(
      new Set(
        selectedConcerns.flatMap((id) => {
          const data = concernData[id] || {};
          return [
            ...(data.emotions || []),
            ...(data.customEmotion?.trim() ? [data.customEmotion.trim()] : []),
          ];
        })
      )
    ).join('、');

    let prompt = `我最近同时被几件事情困扰，整体上感到 ${allEmotions}。\n`;
    prompt += `目前最影响我的三件事是：${selectedConcerns
      .map((id) => CONCERNS_CONFIG.find((c) => c.id === id).title)
      .join('、')}。\n\n`;

    selectedConcerns.forEach((id, index) => {
      const config = CONCERNS_CONFIG.find((c) => c.id === id);
      const data = concernData[id];
      const ordinal = ['第一', '第二', '第三'][index];

      const cueList = [
        ...(data.cues || []),
        ...(data.customCue?.trim() ? [data.customCue.trim()] : []),
      ];

      const emotionList = [
        ...(data.emotions || []),
        ...(data.customEmotion?.trim() ? [data.customEmotion.trim()] : []),
      ];

      const impactList = [
        ...(data.impacts || []),
        ...(data.customImpact?.trim() ? [data.customImpact.trim()] : []),
      ];

      prompt += `${ordinal}，关于「${config.title}」，现在的情况是 ${cueList.join('，')}，这让我感到 ${emotionList.join('、')}，也让我 ${impactList.join('、')}。\n`;
    });

    prompt += `\n我现在最需要的是 ${supportNeeds.join('和')}。\n`;
    prompt += `希望你能用 ${responseStyle} 的方式来回应我。\n`;

    if (optionalText.trim()) {
      prompt += `\n如果有必要，我还想补充：${optionalText}`;
    } else {
      prompt += `\n如果有必要，我还想补充：我并不是想立刻得到标准答案，只是想先把自己理清楚。`;
    }

    return prompt;
  };

  const copyToClipboard = () => {
    const text = generatePrompt();
    const textArea = document.createElement('textarea');
    textArea.value = text;
    document.body.appendChild(textArea);
    textArea.select();
    try {
      document.execCommand('copy');
      setShowCopyFeedback(true);
      setTimeout(() => setShowCopyFeedback(false), 2000);
    } catch (err) {
      console.error('Copy failed', err);
    }
    document.body.removeChild(textArea);
  };

  // Screen 0: Scenario Entry
  const renderStep0 = () => (
    <div className="flex flex-col items-center text-center py-8">
      <div className="w-16 h-16 bg-[#EDF1CF] rounded-2xl flex items-center justify-center mb-6 text-[#A7C4A0]">
        <MessageCircle size={32} />
      </div>
      <h1 className="text-2xl font-bold text-[#4A4A4A] mb-4">我们先一起理清你现在想说的内容</h1>
      <p className="text-[#666666] mb-8 max-w-md">你不需要一次把所有事情都说清楚。我们会一步一步帮你整理。</p>
      <div className="bg-[#FAF4E0] p-6 rounded-2xl text-left border border-[#E8DDC2] mb-10 leading-relaxed">
        <p className="text-[#666666] text-sm">
          建议使用场景：
          <br />
          假设你现在是一名在英国留学的中国学生。最近你正处于一个压力比较大的阶段，生活中可能有几件事情同时影响着你的状态。你想向 AI 寻求一些支持，但在真正开口之前，你需要先理清楚自己想说什么。
        </p>
      </div>
      <button
        onClick={handleNext}
        className="bg-[#A7C4A0] hover:bg-[#96B58F] text-white px-10 py-4 rounded-full font-medium transition-all shadow-lg shadow-[#D9E2D4] flex items-center gap-2 group"
      >
        开始整理 <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
      </button>
      <p className="mt-6 text-xs text-[#8A8A8A]">整个过程大约需要 3–5 分钟</p>
    </div>
  );

  // Screen 1: Concern Selection
  const renderStep1 = () => (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-[#4A4A4A] mb-2">现在最压在你心上的三件事是什么？</h2>
        <p className="text-[#666666]">请选择 3 个你现在最想倾诉、最想整理的问题。</p>
      </div>

      <div className="grid grid-cols-1 gap-4 mb-8">
        {CONCERNS_CONFIG.map((item) => {
          const isSelected = selectedConcerns.includes(item.id);
          return (
            <div
              key={item.id}
              onClick={() => toggleConcern(item.id)}
              className={`relative p-5 rounded-2xl border-2 transition-all cursor-pointer flex items-start gap-4 ${
                isSelected
                  ? 'border-[#A7C4A0] bg-[#D0DEBD] ring-4 ring-[#EDF1CF]'
                  : 'border-[#D9E2D4] bg-white hover:border-[#A7C4A0]'
              }`}
            >
              <div className={`p-3 rounded-xl ${isSelected ? 'bg-[#A7C4A0] text-white' : 'bg-[#F3F5EF] text-[#8A8A8A]'}`}>
                {item.icon}
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-[#4A4A4A]">{item.title}</h3>
                <p className="text-sm text-[#666666] mt-1">{item.desc}</p>
              </div>
              {isSelected && (
                <div className="absolute right-4 top-4 bg-[#A7C4A0] rounded-full p-1 text-white">
                  <Check size={14} />
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="flex items-center justify-between mt-auto pt-6 border-t border-[#E7ECE3]">
        <span className="text-sm font-medium text-[#6B7F6B]">已选择 {selectedConcerns.length} / 3</span>
        <div className="flex gap-3">
          <button onClick={handleBack} className="px-6 py-3 text-[#666666] font-medium">
            返回
          </button>
          <button
            disabled={selectedConcerns.length !== 3}
            onClick={handleNext}
            className={`px-8 py-3 rounded-full font-medium transition-all ${
              selectedConcerns.length === 3
                ? 'bg-[#A7C4A0] text-white shadow-lg shadow-[#D9E2D4]'
                : 'bg-[#E7ECE3] text-[#A0A0A0] cursor-not-allowed'
            }`}
          >
            继续
          </button>
        </div>
      </div>
    </div>
  );

  // Screen 2, 3, 4: Concern Cue Collection
  const renderConcernCues = () => {
    if (!currentConcern) return null;

    const data = concernData[currentConcern.id] || {
      cues: [],
      emotions: [],
      impacts: [],
      customCue: '',
      customEmotion: '',
      customImpact: '',
    };

    const toggleTag = (field, tag) => {
      const currentTags = data[field];
      if (currentTags.includes(tag)) {
        updateConcernData(currentConcern.id, field, currentTags.filter((t) => t !== tag));
      } else {
        updateConcernData(currentConcern.id, field, [...currentTags, tag]);
      }
    };

    const inputClass =
      'w-full px-4 py-3 rounded-xl border border-[#D9E2D4] bg-white text-sm text-[#4A4A4A] outline-none focus:border-[#A7C4A0] placeholder:text-[#8A8A8A]';

    return (
      <div className="animate-in fade-in slide-in-from-right-4 duration-500">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-[#4A4A4A] mb-2">关于「{currentConcern.title}」</h2>
          <p className="text-[#666666]">请从下面的内容中选出最符合你现在状态的部分。</p>
        </div>

        <div className="space-y-10">
          {/* Section A */}
          <section>
            <h3 className="text-sm font-bold text-[#4A4A4A] uppercase tracking-wider mb-4">A. 这件事现在主要是什么情况？</h3>
            <div className="flex flex-wrap gap-3">
              {currentConcern.cues.map((cue) => (
                <button
                  key={cue}
                  onClick={() => toggleTag('cues', cue)}
                  className={`px-4 py-2 rounded-xl text-sm transition-all border ${
                    data.cues.includes(cue)
                      ? 'bg-[#D0DEBD] text-[#4A4A4A] border-[#A7C4A0] shadow-md'
                      : 'bg-white text-[#5A5A5A] border-[#D9E2D4] hover:border-[#A7C4A0]'
                  }`}
                >
                  {cue}
                </button>
              ))}

              <button
                onClick={() => {
                  if (data.customCue !== '') {
                    updateConcernData(currentConcern.id, 'customCue', '');
                  } else {
                    updateConcernData(currentConcern.id, 'customCue', ' ');
                  }
                }}
                className={`px-4 py-2 rounded-xl text-sm transition-all border ${
                  data.customCue !== ''
                    ? 'bg-[#D0DEBD] text-[#4A4A4A] border-[#A7C4A0]'
                    : 'bg-white text-[#5A5A5A] border-[#D9E2D4] hover:border-[#A7C4A0]'
                }`}
              >
                其他
              </button>
            </div>

            {data.customCue !== '' && (
              <div className="mt-4">
                <input
                  type="text"
                  value={data.customCue.trimStart()}
                  onChange={(e) => updateConcernData(currentConcern.id, 'customCue', e.target.value)}
                  placeholder="用一句话补充这件事里对你最重要、但选项里没有的内容"
                  className={inputClass}
                />
              </div>
            )}
          </section>

          {/* Section B */}
          <section>
            <h3 className="text-sm font-bold text-[#4A4A4A] uppercase tracking-wider mb-4">B. 这件事让你有什么感受？</h3>
            <div className="flex flex-wrap gap-3">
              {EMOTIONS.map((emo) => (
                <button
                  key={emo}
                  onClick={() => toggleTag('emotions', emo)}
                  className={`px-4 py-2 rounded-xl text-sm transition-all border ${
                    data.emotions.includes(emo)
                      ? 'bg-[#D0DEBD] text-[#4A4A4A] border-[#A7C4A0] shadow-md'
                      : 'bg-white text-[#5A5A5A] border-[#D9E2D4] hover:border-[#A7C4A0]'
                  }`}
                >
                  {emo}
                </button>
              ))}

              <button
                onClick={() => {
                  if (data.customEmotion !== '') {
                    updateConcernData(currentConcern.id, 'customEmotion', '');
                  } else {
                    updateConcernData(currentConcern.id, 'customEmotion', ' ');
                  }
                }}
                className={`px-4 py-2 rounded-xl text-sm transition-all border ${
                  data.customEmotion !== ''
                    ? 'bg-[#D0DEBD] text-[#4A4A4A] border-[#A7C4A0]'
                    : 'bg-white text-[#5A5A5A] border-[#D9E2D4] hover:border-[#A7C4A0]'
                }`}
              >
                其他
              </button>
            </div>

            {data.customEmotion !== '' && (
              <div className="mt-4">
                <input
                  type="text"
                  value={data.customEmotion.trimStart()}
                  onChange={(e) => updateConcernData(currentConcern.id, 'customEmotion', e.target.value)}
                  placeholder="你还可以补充一个更贴近你状态的感受词"
                  className={inputClass}
                />
              </div>
            )}
          </section>

          {/* Section C */}
          <section>
            <h3 className="text-sm font-bold text-[#4A4A4A] uppercase tracking-wider mb-4">C. 它现在最明显地影响了你什么？</h3>
            <div className="flex flex-wrap gap-3">
              {IMPACTS.map((impact) => (
                <button
                  key={impact}
                  onClick={() => toggleTag('impacts', impact)}
                  className={`px-4 py-2 rounded-xl text-sm transition-all border ${
                    data.impacts.includes(impact)
                      ? 'bg-[#D0DEBD] text-[#4A4A4A] border-[#A7C4A0] shadow-md'
                      : 'bg-white text-[#5A5A5A] border-[#D9E2D4] hover:border-[#A7C4A0]'
                  }`}
                >
                  {impact}
                </button>
              ))}

              <button
                onClick={() => {
                  if (data.customImpact !== '') {
                    updateConcernData(currentConcern.id, 'customImpact', '');
                  } else {
                    updateConcernData(currentConcern.id, 'customImpact', ' ');
                  }
                }}
                className={`px-4 py-2 rounded-xl text-sm transition-all border ${
                  data.customImpact !== ''
                    ? 'bg-[#D0DEBD] text-[#4A4A4A] border-[#A7C4A0]'
                    : 'bg-white text-[#5A5A5A] border-[#D9E2D4] hover:border-[#A7C4A0]'
                }`}
              >
                其他
              </button>
            </div>

            {data.customImpact !== '' && (
              <div className="mt-4">
                <input
                  type="text"
                  value={data.customImpact.trimStart()}
                  onChange={(e) => updateConcernData(currentConcern.id, 'customImpact', e.target.value)}
                  placeholder="补充这件事现在最明显带来的影响"
                  className={inputClass}
                />
              </div>
            )}
          </section>
        </div>

        <div className="flex items-center justify-end mt-12 pt-6 border-t border-[#E7ECE3] gap-3">
          <button onClick={handleBack} className="px-6 py-3 text-[#666666] font-medium">
            上一步
          </button>
          <button
            disabled={!isConcernComplete(currentConcern.id)}
            onClick={handleNext}
            className={`px-8 py-3 rounded-full font-medium transition-all ${
              isConcernComplete(currentConcern.id)
                ? 'bg-[#A7C4A0] text-white shadow-lg'
                : 'bg-[#E7ECE3] text-[#A0A0A0] cursor-not-allowed'
            }`}
          >
            下一步
          </button>
        </div>
      </div>
    );
  };

  // Screen 5: Overall Support Need
  const renderSupportNeeds = () => (
    <div className="animate-in fade-in slide-in-from-right-4 duration-500">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-[#4A4A4A] mb-2">你现在最希望得到什么样的回应？</h2>
        <p className="text-[#666666]">可以选 1–2 项最符合你当前需要的。</p>
      </div>

      <div className="space-y-10">
        <section className="bg-[#FAF4E0] rounded-2xl p-5 border border-[#E8DDC2]">
          <h3 className="text-sm font-bold text-[#4A4A4A] uppercase tracking-wider mb-4">你希望得到什么支持？</h3>
          <div className="grid grid-cols-2 gap-3">
            {SUPPORT_NEEDS.map((item) => (
              <button
                key={item}
                onClick={() => {
                  if (supportNeeds.includes(item)) {
                    setSupportNeeds(supportNeeds.filter((i) => i !== item));
                  } else if (supportNeeds.length < 2) {
                    setSupportNeeds([...supportNeeds, item]);
                  }
                }}
                className={`p-4 rounded-xl text-left text-sm transition-all border flex justify-between items-center ${
                  supportNeeds.includes(item)
                    ? 'bg-[#D0DEBD] text-[#4A4A4A] border-[#A7C4A0]'
                    : 'bg-white text-[#5A5A5A] border-[#D9E2D4]'
                }`}
              >
                {item}
                {supportNeeds.includes(item) && <Check size={14} />}
              </button>
            ))}
          </div>
        </section>

        <section className="bg-[#EDF1CF] rounded-2xl p-5 border border-[#D9E2D4]">
          <h3 className="text-sm font-bold text-[#4A4A4A] uppercase tracking-wider mb-4">你希望 AI 用什么方式回应你？</h3>
          <div className="flex flex-wrap gap-3">
            {RESPONSE_STYLES.map((item) => (
              <button
                key={item}
                onClick={() => setResponseStyle(item)}
                className={`px-4 py-3 rounded-xl text-sm transition-all border ${
                  responseStyle === item
                    ? 'bg-[#EDF1CF] text-[#4A4A4A] border-[#A7C4A0]'
                    : 'bg-white text-[#5A5A5A] border-[#D9E2D4] hover:border-[#A7C4A0]'
                }`}
              >
                {item}
              </button>
            ))}
          </div>
        </section>
      </div>

      <div className="flex items-center justify-end mt-12 pt-6 border-t border-[#E7ECE3] gap-3">
        <button onClick={handleBack} className="px-6 py-3 text-[#666666] font-medium">
          上一步
        </button>
        <button
          disabled={supportNeeds.length === 0 || !responseStyle}
          onClick={handleNext}
          className={`px-8 py-3 rounded-full font-medium transition-all ${
            supportNeeds.length > 0 && responseStyle
              ? 'bg-[#A7C4A0] text-white shadow-lg'
              : 'bg-[#E7ECE3] text-[#A0A0A0] cursor-not-allowed'
          }`}
        >
          继续
        </button>
      </div>
    </div>
  );

  // Screen 6: Optional Addition
  const renderOptional = () => (
    <div className="animate-in fade-in slide-in-from-right-4 duration-500">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-[#4A4A4A] mb-2">还有什么你想补充的吗？</h2>
        <p className="text-[#666666]">这一步是可选的。如果前面已经足够表达，也可以直接继续。</p>
      </div>

      <div className="bg-white rounded-2xl border border-[#D9E2D4] p-6 shadow-sm">
        <textarea
          rows={6}
          value={optionalText}
          onChange={(e) => setOptionalText(e.target.value)}
          placeholder="写下任何你觉得重要、但前面还没有表达出来的内容。"
          className="w-full text-[#4A4A4A] outline-none resize-none placeholder:text-[#8A8A8A]"
        />
        <div className="mt-4 flex justify-end">
          <span className="text-xs text-[#8A8A8A]">一句到几句即可</span>
        </div>
      </div>

      <div className="flex items-center justify-end mt-12 pt-6 border-t border-[#E7ECE3] gap-3">
        <button onClick={handleBack} className="px-6 py-3 text-[#666666] font-medium">
          上一步
        </button>
        <button onClick={handleNext} className="px-8 py-3 bg-[#A7C4A0] text-white rounded-full font-medium shadow-lg">
          {optionalText.trim() ? '继续' : '跳过并完成'}
        </button>
      </div>
    </div>
  );

  // Screen 7: Result Page
  const renderResult = () => {
    const prompt = generatePrompt();

    const overallEmotions = Array.from(
      new Set(
        selectedConcerns.flatMap((id) => {
          const data = concernData[id] || {};
          return [
            ...(data.emotions || []),
            ...(data.customEmotion?.trim() ? [data.customEmotion.trim()] : []),
          ];
        })
      )
    );

    return (
      <div className="animate-in fade-in zoom-in-95 duration-700">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-[#4A4A4A] mb-2">为你生成的整理草稿</h2>
          <p className="text-[#666666]">系统已经根据你的选择，梳理出了这段表达。你可以直接复制给 AI。</p>
        </div>

        <div className="space-y-6">
          {/* Summary Card */}
          <div className="bg-[#EDF1CF] rounded-2xl p-6 border border-[#D9E2D4]">
            <h3 className="text-sm font-bold text-[#4A4A4A] uppercase tracking-widest mb-4 flex items-center gap-2">
              <Layout size={16} /> 你目前整理出的重点
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <p className="text-xs text-[#6B7F6B] font-bold mb-2 uppercase">整体状态</p>
                <div className="flex flex-wrap gap-1">
                  {overallEmotions.map((e) => (
                    <span key={e} className="px-2 py-0.5 bg-white text-[#4A4A4A] text-xs rounded-lg border border-[#D9E2D4]">
                      {e}
                    </span>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-xs text-[#6B7F6B] font-bold mb-2 uppercase">核心关注</p>
                <p className="text-sm text-[#4A4A4A] leading-relaxed">
                  {selectedConcerns.map((id) => CONCERNS_CONFIG.find((c) => c.id === id).title).join('、')}
                </p>
              </div>
              <div>
                <p className="text-xs text-[#6B7F6B] font-bold mb-2 uppercase">需要支持</p>
                <p className="text-sm text-[#4A4A4A] leading-relaxed">{supportNeeds.join('、')}</p>
              </div>
              <div>
                <p className="text-xs text-[#6B7F6B] font-bold mb-2 uppercase">偏好风格</p>
                <p className="text-sm text-[#4A4A4A] leading-relaxed">{responseStyle}</p>
              </div>
            </div>
          </div>

          {/* Prompt Area */}
          <div className="relative bg-white rounded-2xl border-2 border-[#D9E2D4] overflow-hidden group">
            <div className="bg-[#F3F5EF] px-6 py-3 border-b border-[#D9E2D4] flex justify-between items-center">
              <span className="text-xs font-bold text-[#4A4A4A] uppercase">AI 表达草稿</span>
              <button
                onClick={copyToClipboard}
                className="text-xs flex items-center gap-1 text-[#4A4A4A] font-bold bg-white px-3 py-1 rounded-full shadow-sm border border-[#D9E2D4] hover:bg-[#A7C4A0] hover:text-white transition-all active:scale-95"
              >
                {showCopyFeedback ? (
                  <>
                    <Check size={12} /> 已复制
                  </>
                ) : (
                  <>
                    <Copy size={12} /> 复制内容
                  </>
                )}
              </button>
            </div>
            <div className="p-6 text-sm text-[#4A4A4A] leading-relaxed whitespace-pre-wrap font-serif">{prompt}</div>
          </div>
        </div>

        <div className="flex items-center justify-between mt-12 pt-6 border-t border-[#E7ECE3]">
          <button onClick={handleBack} className="px-6 py-3 text-[#8A8A8A] font-medium hover:text-[#4A4A4A] transition-colors">
            返回修改
          </button>
          <div className="flex gap-4">
            <button
              onClick={() => window.location.reload()}
              className="px-8 py-3 border border-[#D9E2D4] bg-white text-[#666666] rounded-full font-medium hover:bg-[#F3F5EF]"
            >
              重新整理
            </button>
            <button className="px-8 py-3 bg-[#A7C4A0] text-white rounded-full font-medium shadow-lg hover:bg-[#96B58F] transition-all flex items-center gap-2">
              确认使用这段草稿 <Check size={18} />
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-[#F8F8F2] text-[#4A4A4A] font-sans selection:bg-[#D0DEBD]">
      <div className="max-w-2xl mx-auto px-6 py-12 flex flex-col min-h-screen">
        {/* Header / Branding */}
        <header className="flex justify-between items-center mb-10">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-[#A7C4A0] rounded-lg flex items-center justify-center text-white">
              <Heart size={18} fill="currentColor" />
            </div>
            <span className="font-bold text-[#4A4A4A] tracking-tight">Cue-to-Prompt</span>
          </div>

          {step > 0 && step < 7 && (
            <div className="text-xs font-bold text-[#6B7F6B] uppercase tracking-widest bg-white px-3 py-1 rounded-full border border-[#D9E2D4]">
              步骤 {step} / 6
            </div>
          )}
        </header>

        {/* Progress Bar */}
        {step > 0 && step < 7 && <ProgressBar current={step} total={6} />}

        {/* Main Content Area */}
        <main className="flex-1">
          {step === 0 && renderStep0()}
          {step === 1 && renderStep1()}
          {step >= 2 && step <= 4 && renderConcernCues()}
          {step === 5 && renderSupportNeeds()}
          {step === 6 && renderOptional()}
          {step === 7 && renderResult()}
        </main>

        {/* Footer */}
        <footer className="mt-12 text-center py-6">
          <p className="text-xs text-[#8A8A8A]">Cue-to-Prompt Prototype v1.0 • 轻量情绪支持引导</p>
        </footer>
      </div>
    </div>
  );
}