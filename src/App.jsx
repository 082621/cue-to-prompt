import React, { useState, useEffect, useMemo } from 'react';
import { ChevronRight, ChevronLeft, Check, Copy, MessageCircle, ArrowRight, Layout, Users, Compass, Home, BookOpen, Heart, Sparkles } from 'lucide-react';

// --- 数据配置 ---
const CONCERNS_CONFIG = [
  {
    id: 'academic',
    title: '学业压力',
    desc: '截止日期、成绩、进度、专注困难',
    icon: <BookOpen className="w-5 h-5" />,
    cues: ['截止日期都堆在一起', '感觉自己进度落后', '学业任务太多', '考试 / 成绩压力大', '很难专心', '担心自己表现不够好']
  },
  {
    id: 'future',
    title: '未来规划不确定',
    desc: '毕业去向、求职、方向选择',
    icon: <Compass className="w-5 h-5" />,
    cues: ['不知道毕业后要做什么', '害怕自己选错方向', '对找工作很焦虑', '没有明确方向', '总在和别人比较', '对下一步感到卡住了']
  },
  {
    id: 'family',
    title: '家庭期待',
    desc: '家人压力、解释困难、害怕辜负',
    icon: <Home className="w-5 h-5" />,
    cues: ['担心让家人失望', '很难和家里解释我现在的情况', '感到来自家庭的压力', '对未来选择有很强的家庭期待', '会因为达不到期待而内疚', '家人的期待压得我有点喘']
  },
  {
    id: 'social',
    title: '人际关系 / 孤独感',
    desc: '孤独、关系摩擦、缺乏支持',
    icon: <Users className="w-5 h-5" />,
    cues: ['感觉自己很孤单', '很难建立真正亲近的关系', '感觉没有人真正理解我', '和朋友 / 室友之间有摩擦', '很想要情感支持', '即使身边有人，也还是觉得孤单']
  },
  {
    id: 'culture',
    title: '文化适应压力',
    desc: '语言、归属感、持续适应的疲惫',
    icon: <Sparkles className="w-5 h-5" />,
    cues: ['语言沟通有压力', '总觉得自己不完全属于这里', '一直在适应新的环境，感觉很累', '不同的社交规则让我有压力', '感觉夹在两种文化之间', '在这个环境里很难自然表达自己']
  }
];

const EMOTIONS = ['焦虑', '压力大', '孤独', '迷茫', '内疚', '烦躁', '很累', '卡住了', '委屈', '情绪很绷'];

// 更新后的影响项列表，新增了用户要求的两个选项
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
  '我有点不想面对它'
];

const SUPPORT_NEEDS = ['情绪安慰', '实际建议', '帮我整理思路', '鼓励和支持', '帮我理清下一步怎么做', '只是想被认真听一听'];

const RESPONSE_STYLES = ['温柔一点', '更具体一点', '一步一步地帮我分析', '简洁直接', '更像陪我理清思路', '不要太空泛'];

// --- 子组件：进度条 ---
const ProgressBar = ({ current, total }) => {
  const progress = (current / total) * 100;
  return (
    <div className="w-full h-1 bg-gray-100 rounded-full overflow-hidden mb-8">
      <div 
        className="h-full bg-indigo-400 transition-all duration-500 ease-out" 
        style={{ width: `${progress}%` }}
      />
    </div>
  );
};

// --- 主应用 ---
export default function App() {
  const [step, setStep] = useState(0); // 0 to 7
  const [selectedConcerns, setSelectedConcerns] = useState([]); // indices of CONCERNS_CONFIG
  const [concernData, setConcernData] = useState({}); // { concernId: { cues: [], emotions: [], impacts: [] } }
  const [supportNeeds, setSupportNeeds] = useState([]);
  const [responseStyle, setResponseStyle] = useState("");
  const [optionalText, setOptionalText] = useState("");
  const [showCopyFeedback, setShowCopyFeedback] = useState(false);

  // 计算当前是第几个 Concern Collection 页面
  const concernStepIndex = step >= 2 && step <= 4 ? step - 2 : null;
  const currentConcern = concernStepIndex !== null ? CONCERNS_CONFIG.find(c => c.id === selectedConcerns[concernStepIndex]) : null;

  // --- 辅助函数 ---
  const handleNext = () => setStep(s => s + 1);
  const handleBack = () => setStep(s => s - 1);

  const toggleConcern = (id) => {
    if (selectedConcerns.includes(id)) {
      setSelectedConcerns(selectedConcerns.filter(i => i !== id));
    } else if (selectedConcerns.length < 3) {
      setSelectedConcerns([...selectedConcerns, id]);
    }
  };

  const updateConcernData = (id, field, value) => {
    setConcernData(prev => ({
      ...prev,
      [id]: {
        ...(prev[id] || { cues: [], emotions: [], impacts: [] }),
        [field]: value
      }
    }));
  };

  const isConcernComplete = (id) => {
    const data = concernData[id];
    return data && data.cues?.length > 0 && data.emotions?.length > 0 && data.impacts?.length > 0;
  };

  const generatePrompt = () => {
    if (!selectedConcerns.length) return "";

    // 提取所有情绪用于开头
    const allEmotions = Array.from(new Set(selectedConcerns.flatMap(id => concernData[id]?.emotions || []))).join('、');

    let prompt = `我最近同时被几件事情困扰，整体上感到 ${allEmotions}。\n`;
    prompt += `目前最影响我的三件事是：${selectedConcerns.map(id => CONCERNS_CONFIG.find(c => c.id === id).title).join('、')}。\n\n`;

    selectedConcerns.forEach((id, index) => {
      const config = CONCERNS_CONFIG.find(c => c.id === id);
      const data = concernData[id];
      const ordinal = ['第一', '第二', '第三'][index];
      prompt += `${ordinal}，关于「${config.title}」，现在的情况是 ${data.cues.join('，')}，这让我感到 ${data.emotions.join('、')}，也让我 ${data.impacts.join('、')}。\n`;
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
    const textArea = document.createElement("textarea");
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

  // --- 页面渲染逻辑 ---

  // Screen 0: Scenario Entry
  const renderStep0 = () => (
    <div className="flex flex-col items-center text-center py-8">
      <div className="w-16 h-16 bg-indigo-50 rounded-2xl flex items-center justify-center mb-6 text-indigo-500">
        <MessageCircle size={32} />
      </div>
      <h1 className="text-2xl font-bold text-gray-800 mb-4">我们先一起理清你现在想说的内容</h1>
      <p className="text-gray-500 mb-8 max-w-md">你不需要一次把所有事情都说清楚。我们会一步一步帮你整理。</p>
      <div className="bg-orange-50 p-6 rounded-2xl text-left border border-orange-100 mb-10 leading-relaxed">
        <p className="text-orange-800 text-sm">
          建议使用场景：<br/>
          假设你现在是一名在英国留学的中国学生。最近你正处于一个压力比较大的阶段，生活中可能有几件事情同时影响着你的状态。你想向 AI 寻求一些支持，但在真正开口之前，你需要先理清楚自己想说什么。
        </p>
      </div>
      <button 
        onClick={handleNext}
        className="bg-indigo-600 hover:bg-indigo-700 text-white px-10 py-4 rounded-full font-medium transition-all shadow-lg shadow-indigo-200 flex items-center gap-2 group"
      >
        开始整理 <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
      </button>
      <p className="mt-6 text-xs text-gray-400">整个过程大约需要 3–5 分钟</p>
    </div>
  );

  // Screen 1: Concern Selection
  const renderStep1 = () => (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">现在最压在你心上的三件事是什么？</h2>
        <p className="text-gray-500">请选择 3 个你现在最想倾诉、最想整理的问题。</p>
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
                  ? 'border-indigo-500 bg-indigo-50/50 ring-4 ring-indigo-50' 
                  : 'border-gray-100 bg-white hover:border-gray-200'
              }`}
            >
              <div className={`p-3 rounded-xl ${isSelected ? 'bg-indigo-500 text-white' : 'bg-gray-100 text-gray-400'}`}>
                {item.icon}
              </div>
              <div className="flex-1">
                <h3 className={`font-bold ${isSelected ? 'text-indigo-900' : 'text-gray-700'}`}>{item.title}</h3>
                <p className="text-sm text-gray-400 mt-1">{item.desc}</p>
              </div>
              {isSelected && (
                <div className="absolute right-4 top-4 bg-indigo-500 rounded-full p-1 text-white">
                  <Check size={14} />
                </div>
              )}
            </div>
          );
        })}
      </div>
      <div className="flex items-center justify-between mt-auto pt-6 border-t border-gray-50">
        <span className="text-sm font-medium text-gray-500">已选择 {selectedConcerns.length} / 3</span>
        <div className="flex gap-3">
          <button onClick={handleBack} className="px-6 py-3 text-gray-500 font-medium">返回</button>
          <button 
            disabled={selectedConcerns.length !== 3}
            onClick={handleNext}
            className={`px-8 py-3 rounded-full font-medium transition-all ${
              selectedConcerns.length === 3 
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-100' 
                : 'bg-gray-100 text-gray-300 cursor-not-allowed'
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
    const data = concernData[currentConcern.id] || { cues: [], emotions: [], impacts: [] };

    const toggleTag = (field, tag) => {
      let currentTags = data[field];
      if (currentTags.includes(tag)) {
        updateConcernData(currentConcern.id, field, currentTags.filter(t => t !== tag));
      } else {
        updateConcernData(currentConcern.id, field, [...currentTags, tag]);
      }
    };

    return (
      <div className="animate-in fade-in slide-in-from-right-4 duration-500">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-2">关于「{currentConcern.title}」</h2>
          <p className="text-gray-500">请从下面的内容中选出最符合你现在状态的部分。</p>
        </div>

        <div className="space-y-10">
          {/* Section A: 情况 */}
          <section>
            <h3 className="text-sm font-bold text-indigo-500 uppercase tracking-wider mb-4">A. 这件事现在主要是什么情况？</h3>
            <div className="flex flex-wrap gap-3">
              {currentConcern.cues.map(cue => (
                <button
                  key={cue}
                  onClick={() => toggleTag('cues', cue)}
                  className={`px-4 py-2 rounded-xl text-sm transition-all border ${
                    data.cues.includes(cue) 
                      ? 'bg-indigo-600 text-white border-indigo-600 shadow-md' 
                      : 'bg-white text-gray-600 border-gray-100 hover:border-indigo-200'
                  }`}
                >
                  {cue}
                </button>
              ))}
            </div>
          </section>

          {/* Section B: 感受 */}
          <section>
            <h3 className="text-sm font-bold text-indigo-500 uppercase tracking-wider mb-4">B. 这件事让你有什么感受？</h3>
            <div className="flex flex-wrap gap-3">
              {EMOTIONS.map(emo => (
                <button
                  key={emo}
                  onClick={() => toggleTag('emotions', emo)}
                  className={`px-4 py-2 rounded-xl text-sm transition-all border ${
                    data.emotions.includes(emo) 
                      ? 'bg-rose-500 text-white border-rose-500 shadow-md' 
                      : 'bg-white text-gray-600 border-gray-100 hover:border-rose-200'
                  }`}
                >
                  {emo}
                </button>
              ))}
            </div>
          </section>

          {/* Section C: 影响 */}
          <section>
            <h3 className="text-sm font-bold text-indigo-500 uppercase tracking-wider mb-4">C. 它现在最明显地影响了你什么？</h3>
            <div className="flex flex-wrap gap-3">
              {IMPACTS.map(impact => (
                <button
                  key={impact}
                  onClick={() => toggleTag('impacts', impact)}
                  className={`px-4 py-2 rounded-xl text-sm transition-all border ${
                    data.impacts.includes(impact) 
                      ? 'bg-amber-500 text-white border-amber-500 shadow-md' 
                      : 'bg-white text-gray-600 border-gray-100 hover:border-amber-200'
                  }`}
                >
                  {impact}
                </button>
              ))}
            </div>
          </section>
        </div>

        <div className="flex items-center justify-end mt-12 pt-6 border-t border-gray-50 gap-3">
          <button onClick={handleBack} className="px-6 py-3 text-gray-500 font-medium">上一步</button>
          <button 
            disabled={!isConcernComplete(currentConcern.id)}
            onClick={handleNext}
            className={`px-8 py-3 rounded-full font-medium transition-all ${
              isConcernComplete(currentConcern.id)
                ? 'bg-indigo-600 text-white shadow-lg' 
                : 'bg-gray-100 text-gray-300 cursor-not-allowed'
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
        <h2 className="text-2xl font-bold text-gray-800 mb-2">你现在最希望得到什么样的回应？</h2>
        <p className="text-gray-500">可以选 1–2 项最符合你当前需要的。</p>
      </div>

      <div className="space-y-10">
        <section>
          <h3 className="text-sm font-bold text-indigo-500 uppercase tracking-wider mb-4">你希望得到什么支持？</h3>
          <div className="grid grid-cols-2 gap-3">
            {SUPPORT_NEEDS.map(item => (
              <button
                key={item}
                onClick={() => {
                  if (supportNeeds.includes(item)) {
                    setSupportNeeds(supportNeeds.filter(i => i !== item));
                  } else if (supportNeeds.length < 2) {
                    setSupportNeeds([...supportNeeds, item]);
                  }
                }}
                className={`p-4 rounded-xl text-left text-sm transition-all border flex justify-between items-center ${
                  supportNeeds.includes(item) 
                    ? 'bg-indigo-600 text-white border-indigo-600' 
                    : 'bg-white text-gray-600 border-gray-100'
                }`}
              >
                {item}
                {supportNeeds.includes(item) && <Check size={14} />}
              </button>
            ))}
          </div>
        </section>

        <section>
          <h3 className="text-sm font-bold text-indigo-500 uppercase tracking-wider mb-4">你希望 AI 用什么方式回应你？</h3>
          <div className="flex flex-wrap gap-3">
            {RESPONSE_STYLES.map(item => (
              <button
                key={item}
                onClick={() => setResponseStyle(item)}
                className={`px-4 py-3 rounded-xl text-sm transition-all border ${
                  responseStyle === item 
                    ? 'bg-indigo-600 text-white border-indigo-600' 
                    : 'bg-white text-gray-600 border-gray-100 hover:border-indigo-100'
                }`}
              >
                {item}
              </button>
            ))}
          </div>
        </section>
      </div>

      <div className="flex items-center justify-end mt-12 pt-6 border-t border-gray-50 gap-3">
        <button onClick={handleBack} className="px-6 py-3 text-gray-500 font-medium">上一步</button>
        <button 
          disabled={supportNeeds.length === 0 || !responseStyle}
          onClick={handleNext}
          className={`px-8 py-3 rounded-full font-medium transition-all ${
            (supportNeeds.length > 0 && responseStyle)
              ? 'bg-indigo-600 text-white shadow-lg' 
              : 'bg-gray-100 text-gray-300 cursor-not-allowed'
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
        <h2 className="text-2xl font-bold text-gray-800 mb-2">还有什么你想补充的吗？</h2>
        <p className="text-gray-500">这一步是可选的。如果前面已经足够表达，也可以直接继续。</p>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
        <textarea
          rows={6}
          value={optionalText}
          onChange={(e) => setOptionalText(e.target.value)}
          placeholder="写下任何你觉得重要、但前面还没有表达出来的内容。"
          className="w-full text-gray-700 outline-none resize-none placeholder:text-gray-300"
        />
        <div className="mt-4 flex justify-end">
          <span className="text-xs text-gray-400">一句到几句即可</span>
        </div>
      </div>

      <div className="flex items-center justify-end mt-12 pt-6 border-t border-gray-50 gap-3">
        <button onClick={handleBack} className="px-6 py-3 text-gray-500 font-medium">上一步</button>
        <button 
          onClick={handleNext}
          className="px-8 py-3 bg-indigo-600 text-white rounded-full font-medium shadow-lg"
        >
          {optionalText.trim() ? '继续' : '跳过并完成'}
        </button>
      </div>
    </div>
  );

  // Screen 7: Result Page
  const renderResult = () => {
    const prompt = generatePrompt();
    const overallEmotions = Array.from(new Set(selectedConcerns.flatMap(id => concernData[id]?.emotions || [])));

    return (
      <div className="animate-in fade-in zoom-in-95 duration-700">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-2">为你生成的整理草稿</h2>
          <p className="text-gray-500">系统已经根据你的选择，梳理出了这段表达。你可以直接复制给 AI。</p>
        </div>

        <div className="space-y-6">
          {/* Summary Card */}
          <div className="bg-indigo-50/50 rounded-2xl p-6 border border-indigo-100">
            <h3 className="text-sm font-bold text-indigo-700 uppercase tracking-widest mb-4 flex items-center gap-2">
              <Layout size={16} /> 你目前整理出的重点
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <p className="text-xs text-indigo-400 font-bold mb-2 uppercase">整体状态</p>
                <div className="flex flex-wrap gap-1">
                  {overallEmotions.map(e => <span key={e} className="px-2 py-0.5 bg-white text-indigo-600 text-xs rounded-lg border border-indigo-100">{e}</span>)}
                </div>
              </div>
              <div>
                <p className="text-xs text-indigo-400 font-bold mb-2 uppercase">核心关注</p>
                <p className="text-sm text-gray-700 leading-relaxed">
                  {selectedConcerns.map(id => CONCERNS_CONFIG.find(c => c.id === id).title).join('、')}
                </p>
              </div>
              <div>
                <p className="text-xs text-indigo-400 font-bold mb-2 uppercase">需要支持</p>
                <p className="text-sm text-gray-700 leading-relaxed">{supportNeeds.join('、')}</p>
              </div>
              <div>
                <p className="text-xs text-indigo-400 font-bold mb-2 uppercase">偏好风格</p>
                <p className="text-sm text-gray-700 leading-relaxed">{responseStyle}</p>
              </div>
            </div>
          </div>

          {/* Prompt Area */}
          <div className="relative bg-white rounded-2xl border-2 border-indigo-100 overflow-hidden group">
            <div className="bg-indigo-50 px-6 py-3 border-b border-indigo-100 flex justify-between items-center">
              <span className="text-xs font-bold text-indigo-600 uppercase">AI 表达草稿</span>
              <button 
                onClick={copyToClipboard}
                className="text-xs flex items-center gap-1 text-indigo-600 font-bold bg-white px-3 py-1 rounded-full shadow-sm hover:bg-indigo-600 hover:text-white transition-all active:scale-95"
              >
                {showCopyFeedback ? <><Check size={12}/> 已复制</> : <><Copy size={12}/> 复制内容</>}
              </button>
            </div>
            <div className="p-6 text-sm text-gray-600 leading-relaxed whitespace-pre-wrap font-serif">
              {prompt}
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between mt-12 pt-6 border-t border-gray-50">
          <button onClick={handleBack} className="px-6 py-3 text-gray-400 font-medium hover:text-indigo-600 transition-colors">返回修改</button>
          <div className="flex gap-4">
             <button 
                onClick={() => window.location.reload()}
                className="px-8 py-3 border border-gray-200 text-gray-500 rounded-full font-medium hover:bg-gray-50"
              >
                重新整理
              </button>
              <button className="px-8 py-3 bg-indigo-600 text-white rounded-full font-medium shadow-lg hover:bg-indigo-700 transition-all flex items-center gap-2">
                确认使用这段草稿 <Check size={18} />
              </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-[#FDFDFF] text-gray-900 font-sans selection:bg-indigo-100">
      <div className="max-w-2xl mx-auto px-6 py-12 flex flex-col min-h-screen">
        
        {/* Header / Branding */}
        <header className="flex justify-between items-center mb-10">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white">
              <Heart size={18} fill="currentColor" />
            </div>
            <span className="font-bold text-gray-800 tracking-tight">Cue-to-Prompt</span>
          </div>
          {step > 0 && step < 7 && (
            <div className="text-xs font-bold text-gray-400 uppercase tracking-widest bg-gray-50 px-3 py-1 rounded-full border border-gray-100">
              步骤 {step} / 6
            </div>
          )}
        </header>

        {/* Progress Bar (Visible after Start) */}
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

        {/* Footer info */}
        <footer className="mt-12 text-center py-6">
          <p className="text-xs text-gray-300">Cue-to-Prompt Prototype v1.0 • 轻量情绪支持引导</p>
        </footer>
      </div>
    </div>
  );
}