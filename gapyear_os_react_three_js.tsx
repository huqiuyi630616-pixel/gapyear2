import React, { useState, useEffect, useRef } from 'react';
import * as THREE from 'three';
import {
  Compass, Camera, Dumbbell, Wallet, BookOpen, Box, Mic, Coins,
  MapPin, Flame, Scale, PiggyBank, Bell, Check, Plus, Trash2,
  FolderPlus, ArrowLeft, Clock, X, Download, Upload, Sparkles,
  Heart, Gift, Trophy, Search, FileText, GraduationCap, Maximize2, Minimize2, Pencil
} from 'lucide-react';

const STORAGE_KEY = 'gapyear_os_react_huqiuyi_clean_v3';

const DEFAULT_STATE = {
  coins: 0,
  calories: {
    target: 1550,
    meals: []
  },
  weights: [
    { date: '初始', val: 61.0 }
  ],
  schedules: [
    { id: 1, time: '09:00 - 09:40', title: '晨起空腹称重 + 温水唤醒 + 高蛋白早午餐', tag: '作息与减脂', color: 'emerald', done: false },
    { id: 2, time: '10:00 - 11:50', title: '雅思核心词 + 地大黄爱武老师课题组文献精读', tag: '科研与雅思', color: 'sky', done: false },
    { id: 3, time: '14:30 - 17:30', title: '【第13周周二】全天无坐班课 · 毕业设计(论文)自主推进（教一二区507）', tag: '第13周课表', color: 'indigo', done: false },
    { id: 4, time: '19:30 - 21:00', title: '日语新标日跟读 + Three.js/Blender 3D建模实验', tag: '双语与建模', color: 'rose', done: false },
    { id: 5, time: '23:30 - 00:45', title: '睡前沉浸阅读（01:30前准备入睡）', tag: '阅读习惯', color: 'amber', done: false }
  ],
  ddls: [
    { id: 1, title: '第13周：周一/三/五 14:00-17:40《多媒体设计2》', due: '教一楼二区 603', urgent: true },
    { id: 2, title: '毕业设计(论文)推进（教一楼二区507）', due: '第13-15周重点', urgent: false }
  ],
  weekPlan: [
    { day: '周一 (11.23)', classes: ['14:00-17:40 多媒体设计2 (教一二区603)', '毕业设计(论文) (教一二区507·自主)'], workout: '18:10 下课顺路：美背直角肩 + 爬坡25m', isWorkout: true, done: false },
    { day: '周二 (11.24)', classes: ['全天无坐班课 · 毕业设计自主推进'], workout: '科研文献 + 雅思精听训练', isWorkout: false, done: false },
    { day: '周三 (11.25)', classes: ['14:00-17:40 多媒体设计2 (教一二区603)', '毕业设计(论文) (教一二区507·自主)'], workout: '18:10 下课顺路：蜜桃臀腿塑形 + 椭圆机', isWorkout: true, done: false },
    { day: '周四 (11.26)', classes: ['全天无坐班课 · 毕业设计自主推进'], workout: '日语跟读 + 3D建模工作台', isWorkout: false, done: false },
    { day: '周五 (11.27)', classes: ['14:00-17:40 多媒体设计2 (教一二区603)', '毕业设计(论文) (教一二区507·自主)'], workout: '18:10 下课顺路：核心马甲线 + 拉伸放松', isWorkout: true, done: false },
    { day: '周六 (11.28)', classes: [], workout: '周末户外散步 / 欺骗餐微调', isWorkout: false, done: false },
    { day: '周日 (11.29)', classes: ['20:30-22:10 歌声中的党史Z (智慧树)'], workout: '周体重复盘 + 睡前沉浸阅读', isWorkout: false, done: false }
  ],
  wallet: {
    budget: 1500,
    expenses: [],
    rewards: [
      { id: 1, title: '无罪恶感周末放纵美食一顿', cost: 150, icon: '🍜', redeemed: 0 },
      { id: 2, title: '入手一本心仪的古生物/设计画册', cost: 200, icon: '📚', redeemed: 0 },
      { id: 3, title: '清空购物车一件心愿好物 (≤150元)', cost: 350, icon: '🛍️', redeemed: 0 },
      { id: 4, title: '懒觉豁免券（周末睡到自然醒）', cost: 80, icon: '🛌', redeemed: 0 }
    ]
  },
  bookCategories: ['地大专业', '古生物科普', '雅思日语', '3D与开发', '艺术设计'],
  readingStats: {
    totalSeconds: 0,
    streakDays: 0,
    lastReadDate: '',
    periods: { morning: 0, evening: 0, night: 0 }
  },
  books: [],
  pet: {
    species: 'trilobite',
    name: '三叶虫·团子',
    emoji: '🪲',
    level: 1,
    exp: 0,
    maxExp: 100,
    food: 0
  }
};

function buildBookPages(paragraphs) {
  const list = Array.isArray(paragraphs) && paragraphs.length ? paragraphs : ['暂无正文内容'];
  const vw = typeof window !== 'undefined' ? window.innerWidth : 390;
  const vh = typeof window !== 'undefined' ? window.innerHeight : 844;
  const usableWidth = Math.max(240, Math.min(720, vw - 48));
  const usableHeight = Math.max(260, vh - 175);
  const charsPerLine = Math.max(12, Math.floor(usableWidth / 16));
  const maxLinesPerPage = Math.max(6, Math.floor(usableHeight / 31));

  const pages = [];
  let current = [];
  let usedLines = 0;

  const pushSlice = (sliceText, isFirst) => {
    const clean = sliceText.trim();
    if (!clean) return;
    const needed = Math.max(1, Math.ceil((clean.length + (isFirst ? 2 : 0)) / charsPerLine)) + 0.45;
    if (usedLines + needed > maxLinesPerPage && current.length > 0) {
      pages.push(current);
      current = [];
      usedLines = 0;
    }
    current.push(clean);
    usedLines += needed;
  };

  list.forEach((p) => {
    const text = String(p).trim();
    if (!text) return;
    const isHeading = /^(第[零一二三四五六七八九十百千\d]+[章节回篇部分]|Chapter\s*\d+|Section\s*\d+|序言|前言|后记)/i.test(text);
    if (isHeading && current.length > 0) {
      pages.push(current);
      current = [];
      usedLines = 0;
    }
    let rem = text;
    let isFirst = true;
    while (rem.length > 0) {
      const availLines = Math.max(2, Math.floor(maxLinesPerPage - usedLines - 0.5));
      const maxChars = Math.max(charsPerLine * 2, availLines * charsPerLine - (isFirst ? 2 : 0));
      if (rem.length <= maxChars) {
        pushSlice(rem, isFirst);
        break;
      } else {
        let cut = maxChars;
        const punct = rem.slice(Math.floor(maxChars * 0.75), maxChars).search(/[。！？；，、”」\n]/);
        if (punct !== -1) cut = Math.floor(maxChars * 0.75) + punct + 1;
        pushSlice(rem.slice(0, cut), isFirst);
        rem = rem.slice(cut);
        isFirst = false;
        if (usedLines >= maxLinesPerPage - 1.5) {
          pages.push(current);
          current = [];
          usedLines = 0;
        }
      }
    }
  });
  if (current.length > 0) pages.push(current);
  return pages.length ? pages : [['暂无正文内容']];
}

function extractBookToc(pages) {
  const toc = [];
  pages.forEach((pageParas, pageIdx) => {
    const firstLine = pageParas[0] || '';
    if (/^(第[零一二三四五六七八九十百千\d]+[章节回篇部分]|Chapter\s*\d+|Section\s*\d+|序言|前言|后记)/i.test(firstLine)) {
      toc.push({ title: firstLine.slice(0, 32), page: pageIdx });
    } else if (pageIdx === 0 || pageIdx % 4 === 0) {
      toc.push({ title: `第 ${pageIdx + 1} 页 · ${firstLine.slice(0, 18)}...`, page: pageIdx });
    }
  });
  return toc.length ? toc : [{ title: '第 1 页 · 正文开始', page: 0 }];
}

function ThreeLabViewer() {
  const mountRef = useRef(null);
  const [shapeType, setShapeType] = useState('crystal');
  const meshRef = useRef(null);
  const sceneRef = useRef(null);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const scene = new THREE.Scene();
    sceneRef.current = scene;
    const camera = new THREE.PerspectiveCamera(45, container.clientWidth / container.clientHeight, 0.1, 100);
    camera.position.z = 4.2;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    scene.add(new THREE.AmbientLight(0xffffff, 0.85));
    const dirLight = new THREE.DirectionalLight(0x38bdf8, 1.3);
    dirLight.position.set(5, 5, 5);
    scene.add(dirLight);

    const createMesh = (type) => {
      if (meshRef.current) scene.remove(meshRef.current);
      let geo, mat;
      if (type === 'crystal') {
        geo = new THREE.OctahedronGeometry(1.25, 0);
        mat = new THREE.MeshStandardMaterial({ color: 0x10b981, roughness: 0.2, metalness: 0.35, flatShading: true });
      } else if (type === 'ammonite') {
        geo = new THREE.TorusKnotGeometry(0.85, 0.28, 100, 16);
        mat = new THREE.MeshStandardMaterial({ color: 0xf59e0b, roughness: 0.3, metalness: 0.45 });
      } else {
        geo = new THREE.BoxGeometry(1.75, 0.85, 1.75, 3, 2, 3);
        mat = new THREE.MeshStandardMaterial({ color: 0x818cf8, wireframe: true });
      }
      const m = new THREE.Mesh(geo, mat);
      meshRef.current = m;
      scene.add(m);
    };

    createMesh(shapeType);

    let isDragging = false;
    let prev = { x: 0, y: 0 };
    const onDown = (e) => {
      isDragging = true;
      const clientX = e.touches ? e.touches[0].clientX : e.clientX;
      const clientY = e.touches ? e.touches[0].clientY : e.clientY;
      prev = { x: clientX, y: clientY };
    };
    const onMove = (e) => {
      if (!isDragging || !meshRef.current) return;
      const clientX = e.touches ? e.touches[0].clientX : e.clientX;
      const clientY = e.touches ? e.touches[0].clientY : e.clientY;
      meshRef.current.rotation.y += (clientX - prev.x) * 0.012;
      meshRef.current.rotation.x += (clientY - prev.y) * 0.012;
      prev = { x: clientX, y: clientY };
    };
    const onUp = () => { isDragging = false; };

    container.addEventListener('mousedown', onDown);
    container.addEventListener('touchstart', onDown, { passive: true });
    window.addEventListener('mousemove', onMove);
    window.addEventListener('touchmove', onMove, { passive: true });
    window.addEventListener('mouseup', onUp);
    window.addEventListener('touchend', onUp);

    let animId;
    const animate = () => {
      animId = requestAnimationFrame(animate);
      if (meshRef.current && !isDragging) {
        meshRef.current.rotation.y += 0.008;
        meshRef.current.rotation.x += 0.003;
      }
      renderer.render(scene, camera);
    };
    animate();

    const handleResize = () => {
      if (!container) return;
      camera.aspect = container.clientWidth / container.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(container.clientWidth, container.clientHeight);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('touchmove', onMove);
      window.removeEventListener('mouseup', onUp);
      window.removeEventListener('touchend', onUp);
      window.removeEventListener('resize', handleResize);
      renderer.dispose();
    };
  }, [shapeType]);

  return (
    <div className="bg-slate-900 text-white rounded-3xl p-5 flex flex-col justify-between shadow-md">
      <div>
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-bold text-teal-400 bg-teal-950 px-2.5 py-1 rounded-xl border border-teal-800">
            React + Three.js 3D 实验室
          </span>
          <span className="text-[11px] text-slate-400">支持鼠标/触控旋转</span>
        </div>
        <div
          ref={mountRef}
          className="w-full h-60 rounded-2xl bg-slate-950 overflow-hidden relative cursor-grab border border-slate-800 mt-2"
        />
      </div>
      <div className="mt-4 grid grid-cols-3 gap-2">
        {[
          { id: 'crystal', label: '矿物晶体' },
          { id: 'ammonite', label: '菊石螺旋' },
          { id: 'terrain', label: '空间装置' }
        ].map((item) => (
          <button
            key={item.id}
            onClick={() => setShapeType(item.id)}
            className={`py-2 rounded-xl text-xs font-semibold transition ${
              shapeType === item.id ? 'bg-teal-600 text-white' : 'bg-white/10 hover:bg-white/20 text-slate-200'
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>
    </div>
  );
}

export default function App() {
  const [state, setState] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? { ...DEFAULT_STATE, ...JSON.parse(saved) } : DEFAULT_STATE;
    } catch {
      return DEFAULT_STATE;
    }
  });

  const [activeTab, setActiveTab] = useState('dashboard');
  const [toasts, setToasts] = useState([]);
  const [nowTime, setNowTime] = useState(new Date());
  const [weather, setWeather] = useState({ temp: 14, desc: '多云转晴', icon: '🌤️', loc: '武汉·武科大黄家湖校区' });

  const [preImg, setPreImg] = useState('');
  const [postImg, setPostImg] = useState('');
  const [preDesc, setPreDesc] = useState('');
  const [preCal, setPreCal] = useState(0);
  const [leftoverRatio, setLeftoverRatio] = useState(0);
  const [postCal, setPostCal] = useState(0);
  const [mealType, setMealType] = useState('午餐 (12:30)');
  const [weightInput, setWeightInput] = useState('');

  const [selectedWeek, setSelectedWeek] = useState('week13');

  const [bookCat, setBookCat] = useState('all');
  const [bookSearch, setBookSearch] = useState('');
  const [activeBookId, setActiveBookId] = useState(null);
  const [readerSecs, setReaderSecs] = useState(0);
  const [readerTheme, setReaderTheme] = useState('paper');
  const [readerFontSize, setReaderFontSize] = useState(16);
  const [readerNote, setReaderNote] = useState('');
  const [readerPage, setReaderPage] = useState(0);
  const [readerMode, setReaderMode] = useState('page');
  const [showTocDrawer, setShowTocDrawer] = useState(false);
  const [isReaderFullscreen, setIsReaderFullscreen] = useState(true);
  const [hideReaderChrome, setHideReaderChrome] = useState(false);
  const readerScrollRef = useRef(null);
  const touchStartXRef = useRef(null);

  const [modalType, setModalType] = useState(null);
  const [voiceText, setVoiceText] = useState('');
  const voiceTextRef = useRef('');
  const [isListeningVoice, setIsListeningVoice] = useState(false);
  const recognitionRef = useRef(null);
  const [expenseForm, setExpenseForm] = useState({ kind: 'expense', title: '', amount: '15.0', category: '健康餐饮' });
  const [budgetInput, setBudgetInput] = useState(String(state.wallet.budget));
  const [rewardForm, setRewardForm] = useState({ title: '', cost: '120', icon: '🎁' });
  const [newCatInput, setNewCatInput] = useState('');
  const [newBookForm, setNewBookForm] = useState({ title: '', author: '', category: '地大专业', content: '' });
  const [newDDLForm, setNewDDLForm] = useState({ title: '', due: '本周五 22:00' });
  const [editMealForm, setEditMealForm] = useState({ id: null, type: '午餐 (12:30)', desc: '', preCal: 0, leftoverCal: 0 });
  const [editDayForm, setEditDayForm] = useState({ idx: 0, day: '', classesText: '', workout: '', isWorkout: false });
  const [editTxForm, setEditTxForm] = useState({ id: null, kind: 'expense', title: '', amount: '0', category: '健康餐饮' });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {}
  }, [state]);

  useEffect(() => {
    const timer = setInterval(() => setNowTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    fetch('https://api.open-meteo.com/v1/forecast?latitude=30.4408&longitude=114.2654&current_weather=true')
      .then((r) => r.json())
      .then((d) => {
        if (d?.current_weather) {
          const t = Math.round(d.current_weather.temperature);
          const c = d.current_weather.weathercode;
          setWeather({
            temp: t,
            desc: c <= 3 ? '多云晴朗' : c <= 67 ? '小雨微凉' : '降温注意保暖',
            icon: c <= 1 ? '☀️' : c <= 3 ? '🌤️' : '🌧️',
            loc: '武汉·武科大黄家湖校区'
          });
        }
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (!activeBookId) return;
    const interval = setInterval(() => setReaderSecs((s) => s + 1), 1000);
    return () => clearInterval(interval);
  }, [activeBookId]);

  const notify = (msg, type = 'success') => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { id, msg, type }]);
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 3000);
  };

  const grantReward = (coinsDelta, expDelta, msg, foodDelta = 0) => {
    setState((prev) => {
      let newExp = prev.pet.exp + expDelta;
      let newLevel = prev.pet.level;
      let newMaxExp = prev.pet.maxExp;
      if (newExp >= newMaxExp) {
        newLevel += 1;
        newExp -= newMaxExp;
        newMaxExp = Math.round(newMaxExp * 1.2);
      }
      return {
        ...prev,
        coins: prev.coins + coinsDelta,
        pet: {
          ...prev.pet,
          level: newLevel,
          exp: newExp,
          maxExp: newMaxExp,
          food: Math.max(0, prev.pet.food + foodDelta)
        }
      };
    });
    if (msg) notify(msg, 'success');
  };

  const handleWeekChange = (weekKey) => {
    setSelectedWeek(weekKey);
    setState((prev) => {
      const wp = prev.weekPlan.map((d) => ({ ...d }));
      if (weekKey === 'week13') {
        wp[0] = { day: '周一 (11.23)', classes: ['14:00-17:40 多媒体设计2 (教一二区603)', '毕业设计(论文) (教一二区507·自主)'], workout: '18:10 下课顺路：美背直角肩 + 爬坡25m', isWorkout: true, done: false };
        wp[1] = { day: '周二 (11.24)', classes: ['全天无坐班课 · 毕业设计自主推进'], workout: '科研文献 + 雅思精听训练', isWorkout: false, done: false };
        wp[2] = { day: '周三 (11.25)', classes: ['14:00-17:40 多媒体设计2 (教一二区603)', '毕业设计(论文) (教一二区507·自主)'], workout: '18:10 下课顺路：蜜桃臀腿塑形 + 椭圆机', isWorkout: true, done: false };
        wp[3] = { day: '周四 (11.26)', classes: ['全天无坐班课 · 毕业设计自主推进'], workout: '日语跟读 + 3D建模工作台', isWorkout: false, done: false };
        wp[4] = { day: '周五 (11.27)', classes: ['14:00-17:40 多媒体设计2 (教一二区603)', '毕业设计(论文) (教一二区507·自主)'], workout: '18:10 下课顺路：核心马甲线 + 拉伸放松', isWorkout: true, done: false };
        wp[5] = { day: '周六 (11.28)', classes: [], workout: '周末户外散步 / 欺骗餐微调', isWorkout: false, done: false };
        wp[6] = { day: '周日 (11.29)', classes: ['20:30-22:10 歌声中的党史Z (智慧树)'], workout: '周体重复盘 + 睡前沉浸阅读', isWorkout: false, done: false };
      } else if (weekKey === 'week14_15') {
        wp[0] = { day: '周一', classes: ['14:00-17:40 多媒体设计2 (教一二区603)'], workout: '18:10 美背直角肩 + 爬坡25m', isWorkout: true, done: false };
        wp[1] = { day: '周二', classes: ['14:00-17:40 学科综合设计(二) (教一二区603)'], workout: '科研文献 + 雅思精听训练', isWorkout: false, done: false };
        wp[2] = { day: '周三', classes: ['08:20-12:00 学科综合设计(二)', '14:00-17:40 多媒体设计2 (14周)'], workout: '18:10 蜜桃臀腿塑形 + 椭圆机', isWorkout: true, done: false };
        wp[3] = { day: '周四', classes: ['14:00-17:40 学科综合设计(二) (教一二区603)'], workout: '日语跟读 + 3D建模工作台', isWorkout: false, done: false };
        wp[4] = { day: '周五', classes: ['14:00-17:40 多媒体设计2 (教一二区603)'], workout: '18:10 核心马甲线 + 拉伸放松', isWorkout: true, done: false };
        wp[5] = { day: '周六', classes: [], workout: '周末户外散步 / 欺骗餐微调', isWorkout: false, done: false };
        wp[6] = { day: '周日', classes: ['20:30-22:10 歌声中的党史Z (智慧树)'], workout: '周体重复盘 + 睡前沉浸阅读', isWorkout: false, done: false };
      } else {
        wp[0] = { day: '周一', classes: ['08:20-12:00 公共空间营造 (裴磊·教一二区603)'], workout: '16:30 美背直角肩 + 爬坡25m', isWorkout: true, done: false };
        wp[1] = { day: '周二', classes: ['14:00-17:40 学科综合设计(二) (16周)'], workout: '科研文献 + 雅思精听训练', isWorkout: false, done: false };
        wp[2] = { day: '周三', classes: ['08:20-12:00 公共空间营造 (裴磊·教一二区603)'], workout: '16:30 蜜桃臀腿塑形 + 椭圆机', isWorkout: true, done: false };
        wp[3] = { day: '周四', classes: ['14:00-17:40 学科综合设计(二) (16周)'], workout: '日语跟读 + 3D建模工作台', isWorkout: false, done: false };
        wp[4] = { day: '周五', classes: ['08:20-12:00 公共空间营造 (裴磊·教一二区603)'], workout: '16:30 核心马甲线 + 拉伸放松', isWorkout: true, done: false };
        wp[5] = { day: '周六', classes: [], workout: '周末户外散步 / 欺骗餐微调', isWorkout: false, done: false };
        wp[6] = { day: '周日', classes: [], workout: '周体重复盘 + 睡前沉浸阅读', isWorkout: false, done: false };
      }
      return { ...prev, weekPlan: wp };
    });
    notify('已切换教学周课表！', 'info');
  };

  const handlePhotoUpload = (e, stage) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      if (stage === 'pre') {
        setPreImg(ev.target.result);
        const est = Math.floor(520 + Math.random() * 180);
        setPreCal(est);
        setPreDesc('AI识别：二食堂减脂餐（杂粮米饭 + 鸡腿肉 + 清炒时蔬）');
        setPostCal(Math.round(est * (leftoverRatio / 100)));
        notify(`餐前识别完成：约 ${est} kcal`, 'info');
      } else {
        setPostImg(ev.target.result);
        const ratio = Math.floor(15 + Math.random() * 25);
        setLeftoverRatio(ratio);
        const base = preCal || 580;
        if (!preCal) setPreCal(base);
        setPostCal(Math.round(base * (ratio / 100)));
        notify(`餐后对比完成：剩余 ${ratio}%，已自动扣除残余热量！`, 'success');
      }
    };
    reader.readAsDataURL(file);
  };

  const commitMeal = () => {
    const netCal = Math.max(0, preCal - postCal);
    if (netCal <= 0 && preCal <= 0) {
      notify('请先拍摄照片或输入餐前热量哦！', 'warning');
      return;
    }
    const now = new Date();
    const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    setState((prev) => ({
      ...prev,
      calories: {
        ...prev.calories,
        meals: [
          {
            id: Date.now(),
            type: mealType,
            desc: preDesc || '日常减脂餐记录',
            preCal,
            leftoverCal: postCal,
            netCal,
            time: timeStr
          },
          ...prev.calories.meals
        ]
      }
    }));
    setPreImg('');
    setPostImg('');
    setPreDesc('');
    setPreCal(0);
    setLeftoverRatio(0);
    setPostCal(0);
    grantReward(20, 20, `饮食记录已入账（净摄入 ${netCal} kcal），获得 +20 自律金币！`);
  };

  const applyFitnessMode = (mode) => {
    setState((prev) => {
      const wp = prev.weekPlan.map((d) => ({ ...d }));
      if (mode === 'normal') {
        wp[0].workout = '18:10 下课顺路：美背直角肩 + 爬坡25m';
        wp[0].isWorkout = true;
        wp[1].workout = '全天自由 · 科研文献 + 雅思精听';
        wp[1].isWorkout = false;
        wp[2].workout = '18:10 下课顺路：蜜桃臀腿塑形 + 椭圆机';
        wp[2].isWorkout = true;
        wp[3].workout = '全天自由 · 日语跟读 + 3D建模';
        wp[3].isWorkout = false;
        wp[4].workout = '18:10 下课顺路：核心马甲线 + 拉伸放松';
        wp[4].isWorkout = true;
        wp[5].workout = '周末户外散步 / 欺骗餐微调';
        wp[5].isWorkout = false;
      } else if (mode === 'shift') {
        wp[0].workout = '18:10 下课顺路：美背直角肩 + 爬坡25m';
        wp[0].isWorkout = true;
        wp[2].workout = '下午连堂后休息 · 睡前10m拉伸';
        wp[2].isWorkout = false;
        wp[3].workout = '【顺延】16:30 蜜桃臀腿塑形 + 椭圆机';
        wp[3].isWorkout = true;
        wp[4].workout = '下午连堂后休息 · 调整恢复';
        wp[4].isWorkout = false;
        wp[5].workout = '【顺延】15:30 核心马甲线冲刺';
        wp[5].isWorkout = true;
      } else if (mode === 'dorm') {
        wp[0].workout = '室内宿舍35m：哑铃美背 + 帕梅拉燃脂';
        wp[0].isWorkout = true;
        wp[2].workout = '室内宿舍35m：弹力带蜜桃臀 + 自重深蹲';
        wp[2].isWorkout = true;
        wp[4].workout = '室内宿舍30m：核心马甲线 + 全身泡沫轴拉伸';
        wp[4].isWorkout = true;
      }
      return { ...prev, weekPlan: wp };
    });
    if (mode === 'normal') notify('已恢复 1/3/5 下午17:40下课顺路练排期！', 'info');
    if (mode === 'shift') notify('已弹性顺延至周四与周六，避开连堂疲劳！', 'success');
    if (mode === 'dorm') notify('已切换为室内宿舍 35 分钟无器械/小哑铃跟练模式！', 'warning');
  };

  const toggleVoiceMic = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      notify('当前浏览器不支持原生麦克风，可直接在下方输入框打字或语音输入法输入！', 'warning');
      return;
    }
    if (isListeningVoice && recognitionRef.current) {
      recognitionRef.current.stop();
      setIsListeningVoice(false);
      return;
    }
    const rec = new SpeechRecognition();
    rec.lang = 'zh-CN';
    rec.interimResults = true;
    rec.continuous = false;
    rec.onstart = () => setIsListeningVoice(true);
    rec.onresult = (e) => {
      let transcript = '';
      for (let i = 0; i < e.results.length; i++) {
        transcript += e.results[i][0].transcript;
      }
      voiceTextRef.current = transcript;
      setVoiceText(transcript);
    };
    rec.onerror = () => {
      setIsListeningVoice(false);
      notify('未检测到语音输入，可直接打字或使用手机输入法语音转文字', 'info');
    };
    rec.onend = () => setIsListeningVoice(false);
    recognitionRef.current = rec;
    rec.start();
  };

  const applyVoicePlan = (directInput) => {
    const raw = typeof directInput === 'string' ? directInput : (voiceTextRef.current || voiceText);
    const text = raw.trim();
    if (!text) {
      notify('请先说话或输入需要调整的计划内容哦！', 'warning');
      return;
    }

    const clauses = text.split(/[，,。；;！!？?\n]+/).map((c) => c.trim()).filter(Boolean);
    const dayNames = ['周一', '周二', '周三', '周四', '周五', '周六', '周日'];
    const cnNumMap = { 零: 0, 一: 1, 二: 2, 两: 2, 三: 3, 四: 4, 五: 5, 六: 6, 七: 7, 八: 8, 九: 9, 十: 10, 十一: 11, 十二: 12 };

    const parseTimeRange = (str) => {
      const m = str.match(/(早上|上午|中午|下午|晚上|今晚|明早|明晚)?\s*([零一二两三四五六七八九十\d]{1,2})\s*(?:点|:|：)\s*(半|\d{1,2})?/);
      if (!m) return null;
      const prefix = m[1] || '';
      let hr = parseInt(m[2], 10);
      if (isNaN(hr)) hr = cnNumMap[m[2]] ?? 19;
      if (/下午|晚上|今晚|明晚/.test(prefix) && hr < 12) hr += 12;
      const min = m[3] === '半' ? '30' : (m[3] ? String(m[3]).padStart(2, '0') : '00');
      const endHr = (hr + 1) % 24;
      return `${prefix.includes('明') ? '明日 ' : ''}${String(hr).padStart(2, '0')}:${min} - ${String(endHr).padStart(2, '0')}:${min}`;
    };

    let nextSchedules = state.schedules.map((s) => ({ ...s }));
    let nextWeekPlan = state.weekPlan.map((d) => ({ ...d }));
    let nextDDLs = state.ddls.map((d) => ({ ...d }));
    let nextExpenses = state.wallet.expenses.map((e) => ({ ...e }));
    const actions = [];

    clauses.forEach((clause) => {
      // 1. 取消 / 删除日程
      if (/取消|删掉|删除|不去|不看/.test(clause)) {
        const kw = clause.replace(/.*?(取消|删掉|删除|不去|不看)(了|掉)?/, '').trim();
        const before = nextSchedules.length;
        nextSchedules = nextSchedules.filter((item) => {
          if (kw && (item.title.includes(kw) || item.tag.includes(kw))) return false;
          if (/阅读|看书/.test(clause) && (item.title.includes('阅读') || item.tag.includes('阅读'))) return false;
          if (/健身|练背|练腿|核心/.test(clause) && (item.title.includes('健身') || item.tag.includes('减脂'))) return false;
          if (/雅思/.test(clause) && item.title.includes('雅思')) return false;
          if (/日语/.test(clause) && item.title.includes('日语')) return false;
          return true;
        });
        if (nextSchedules.length < before) {
          actions.push(`已取消「${kw || '相关计划'}」`);
          return;
        }
      }

      // 2. 周内健身调换
      if (/健身|练背|臀腿|马甲线/.test(clause) && /调到|改到|移到|换到|顺延/.test(clause)) {
        const foundDays = dayNames.filter((d) => clause.includes(d));
        if (foundDays.length >= 2) {
          const fromIdx = dayNames.indexOf(foundDays[0]);
          const toIdx = dayNames.indexOf(foundDays[1]);
          const moved = nextWeekPlan[fromIdx].workout;
          nextWeekPlan[fromIdx].workout = '语音已调出 · 自主学习/休息';
          nextWeekPlan[fromIdx].isWorkout = false;
          nextWeekPlan[toIdx].workout = `【语音调入】${moved.replace(/^18:10 下课顺路：/, '')}`;
          nextWeekPlan[toIdx].isWorkout = true;
          actions.push(`已将${foundDays[0]}健身调至${foundDays[1]}`);
          return;
        }
      }

      // 3. 调整已有日程时段
      if (/改到|调到|推迟到|挪到|换到/.test(clause)) {
        const keywords = ['雅思', '日语', '文献', '毕设', '毕业设计', '多媒体', '阅读', '看书', '健身', '建模'];
        const matched = nextSchedules.find((s) =>
          keywords.some((k) => clause.includes(k) && (s.title.includes(k) || s.tag.includes(k)))
        );
        if (matched) {
          const newTime = parseTimeRange(clause) || '已调整时段';
          matched.time = newTime;
          matched.done = false;
          actions.push(`已将「${matched.title.slice(0, 12)}...」调整至 ${newTime}`);
          return;
        }
      }

      // 4. 消费 / 收入记账
      const moneyMatch = clause.match(/(\d+(?:\.\d+)?)\s*(?:元|块)/);
      if (moneyMatch) {
        const amt = parseFloat(moneyMatch[1]);
        const isInc = /收入|工资|奖学金|兼职|进账|收到|红包|报销/.test(clause);
        nextExpenses.unshift({
          id: Date.now() + Math.random(),
          kind: isInc ? 'income' : 'expense',
          title: `${isInc ? '语音收入' : '语音记账'}：${clause.slice(0, 16)}`,
          amount: amt,
          category: isInc ? '奖学金/兼职' : (/食堂|餐|饭|面|粉|鸡|菜/.test(clause) ? '健康餐饮' : '日用服饰'),
          date: '刚刚'
        });
        actions.push(`${isInc ? '已记收入' : '已记支出'} ¥${amt}`);
        return;
      }

      // 5. 新增 DDL / 提醒
      if (/提醒|DDL|交作业|初稿|答辩/.test(clause)) {
        const cleanTitle = clause.replace(/^(另外|还有|帮我)?(新增)?(一个)?提醒(我)?/, '').trim() || clause;
        nextDDLs.unshift({ id: Date.now() + Math.random(), title: cleanTitle, due: '语音设定提醒', urgent: true });
        actions.push(`已新增提醒「${cleanTitle.slice(0, 12)}」`);
        return;
      }

      // 6. 通用新增日程排期（自动识别口语时间或智能分配空余时段）
      const extractedTime = parseTimeRange(clause) || (/睡前|今晚|晚上/.test(clause) ? '21:30 - 22:30' : /下午/.test(clause) ? '15:00 - 16:30' : '19:00 - 20:00');
      nextSchedules.push({
        id: Date.now() + Math.random(),
        time: extractedTime,
        title: `语音排期：${clause}`,
        tag: /看书|阅读/.test(clause) ? '阅读计划' : /健身|跑步|练/.test(clause) ? '61kg减脂' : '语音新增',
        color: /看书|阅读/.test(clause) ? 'amber' : /健身|跑步|练/.test(clause) ? 'rose' : 'indigo',
        done: false
      });
      actions.push(`已排入 ${extractedTime} 日程`);
    });

    setState((prev) => ({
      ...prev,
      schedules: nextSchedules,
      weekPlan: nextWeekPlan,
      ddls: nextDDLs,
      wallet: { ...prev.wallet, expenses: nextExpenses }
    }));

    if (recognitionRef.current && isListeningVoice) {
      recognitionRef.current.stop();
    }
    voiceTextRef.current = '';
    setVoiceText('');
    setModalType(null);
    grantReward(15, 15, `语音执行成功：${actions.join('；')}`);
  };

  const handleOpenBook = (book) => {
    setActiveBookId(book.id);
    setReaderPage(book.currentPage || 0);
    setShowTocDrawer(false);
    setHideReaderChrome(false);
    setReaderSecs(0);
  };

  const updateBookPageProgress = (bookId, targetPageIdx, totalPages) => {
    const safeIdx = Math.max(0, Math.min(totalPages - 1, targetPageIdx));
    const pct = totalPages <= 1 ? 100 : Math.round(((safeIdx + 1) / totalPages) * 100);
    setReaderPage(safeIdx);
    if (readerScrollRef.current) readerScrollRef.current.scrollTop = 0;
    setState((prev) => ({
      ...prev,
      books: prev.books.map((b) =>
        b.id === bookId ? { ...b, currentPage: safeIdx, progress: Math.max(b.progress || 0, pct) } : b
      )
    }));
  };

  const handleCloseReader = () => {
    if (activeBookId && readerSecs >= 5) {
      const addedMins = Math.max(1, Math.round(readerSecs / 60));
      const hr = new Date().getHours();
      const periodKey = hr >= 6 && hr < 14 ? 'morning' : hr >= 14 && hr < 22 ? 'evening' : 'night';
      const todayStr = new Date().toISOString().slice(0, 10);

      setState((prev) => ({
        ...prev,
        books: prev.books.map((b) => (b.id === activeBookId ? { ...b, readMins: b.readMins + addedMins } : b)),
        readingStats: {
          totalSeconds: prev.readingStats.totalSeconds + readerSecs,
          streakDays: prev.readingStats.lastReadDate === todayStr ? prev.readingStats.streakDays : prev.readingStats.streakDays + 1,
          lastReadDate: todayStr,
          periods: {
            ...prev.readingStats.periods,
            [periodKey]: (prev.readingStats.periods[periodKey] || 0) + readerSecs
          }
        }
      }));
      grantReward(15, 15, `本次真实阅读 ${readerSecs} 秒，进度与时长已自动保存！`);
    }
    setActiveBookId(null);
    setShowTocDrawer(false);
    setHideReaderChrome(false);
    setReaderSecs(0);
  };

  const handleImportEbookFile = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!newBookForm.title) {
      setNewBookForm((f) => ({ ...f, title: file.name.replace(/\.(txt|md|epub|pdf)$/i, '') }));
    }
    const buffer = await file.arrayBuffer();
    let decodedText = '';
    try {
      const utf8Text = new TextDecoder('utf-8', { fatal: true }).decode(buffer);
      decodedText = utf8Text;
    } catch {
      decodedText = new TextDecoder('gb18030').decode(buffer);
    }
    const cleaned = decodedText.replace(/<[^>]+>/g, '\n').replace(/\r\n/g, '\n');
    setNewBookForm((f) => ({ ...f, content: cleaned }));
    notify(`已完整导入《${file.name}》（共 ${cleaned.length} 字），支持自动分章与翻页阅读！`, 'success');
  };

  useEffect(() => {
    if (!activeBookId) return;
    const book = state.books.find((b) => b.id === activeBookId);
    if (!book) return;
    const pages = buildBookPages(book.content);
    const onKeyDown = (e) => {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
      if (e.key === 'Escape' && isReaderFullscreen) {
        setIsReaderFullscreen(false);
        setHideReaderChrome(false);
        return;
      }
      if (readerMode !== 'page') return;
      if (e.key === 'ArrowRight' || e.key === 'PageDown') {
        updateBookPageProgress(activeBookId, readerPage + 1, pages.length);
      } else if (e.key === 'ArrowLeft' || e.key === 'PageUp') {
        updateBookPageProgress(activeBookId, readerPage - 1, pages.length);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [activeBookId, readerMode, readerPage, state.books, isReaderFullscreen]);

  const totalNetCal = state.calories.meals.reduce((a, b) => a + b.netCal, 0);
  const totalSavedCal = state.calories.meals.reduce((a, b) => a + b.leftoverCal, 0);
  const latestWeight = state.weights[state.weights.length - 1]?.val || 61.0;
  const totalSpent = state.wallet.expenses
    .filter((e) => (e.kind || 'expense') === 'expense')
    .reduce((a, b) => a + b.amount, 0);
  const totalIncome = state.wallet.expenses
    .filter((e) => e.kind === 'income')
    .reduce((a, b) => a + b.amount, 0);
  const savedMoney = Math.max(0, state.wallet.budget + totalIncome - totalSpent);
  const activeBook = state.books.find((b) => b.id === activeBookId);

  const hmStr = `${String(nowTime.getHours()).padStart(2, '0')}:${String(nowTime.getMinutes()).padStart(2, '0')}`;
  const secStr = `${String(nowTime.getSeconds()).padStart(2, '0')}s`;
  const weekDayNames = ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六'];
  const dateStr = `${nowTime.getFullYear()}年${nowTime.getMonth() + 1}月${nowTime.getDate()}日 ${weekDayNames[nowTime.getDay()]}`;
  const week13Monday = new Date(2026, 10, 23, 0, 0, 0);
  const currentTeachingWeek = Math.max(1, 13 + Math.floor((nowTime - week13Monday) / (7 * 24 * 3600 * 1000)));
  const todayPlanSummary = state.weekPlan[(nowTime.getDay() + 6) % 7];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 pb-24 lg:pb-10 font-sans">
      <div className="fixed top-4 right-4 left-4 sm:left-auto z-50 flex flex-col gap-2 pointer-events-none">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`px-4 py-3 rounded-2xl shadow-lg text-xs font-bold flex items-center gap-2 ${
              t.type === 'warning' ? 'bg-amber-500 text-slate-950' : t.type === 'info' ? 'bg-slate-900 text-white' : 'bg-emerald-600 text-white'
            }`}
          >
            <Sparkles className="w-4 h-4 shrink-0" />
            <span>{t.msg}</span>
          </div>
        ))}
      </div>

      <header className="sticky top-0 z-30 bg-white/90 backdrop-blur-md border-b border-slate-200/80">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 h-14 sm:h-16 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-gradient-to-br from-emerald-600 to-teal-700 text-white flex items-center justify-center shadow-sm shrink-0">
              <Compass className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <h1 className="font-bold text-slate-900 text-sm sm:text-base tracking-tight truncate">GapYear OS · 胡秋意</h1>
                <button
                  onClick={() => setModalType('backup')}
                  className="text-[10px] sm:text-[11px] font-semibold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1 shrink-0"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span>React+3D独立存档</span>
                </button>
              </div>
              <p className="text-[11px] text-slate-500 truncate">武科大 $\rightarrow$ 地大黄爱武组 · 168cm/61kg · 09:00起-01:30睡</p>
            </div>
          </div>

          <nav className="hidden lg:flex items-center gap-1 bg-slate-100/90 p-1 rounded-2xl">
            {[
              { id: 'dashboard', label: '今日总览', icon: Compass },
              { id: 'diet', label: '餐前餐后', icon: Camera },
              { id: 'fitness', label: '课表与健身', icon: Dumbbell },
              { id: 'wallet', label: '消费与奖励', icon: Wallet },
              { id: 'bookshelf', label: '私人书架', icon: BookOpen },
              { id: 'academic', label: '科研与3D', icon: Box }
            ].map((nav) => {
              const Icon = nav.icon;
              const active = activeTab === nav.id;
              return (
                <button
                  key={nav.id}
                  onClick={() => setActiveTab(nav.id)}
                  className={`px-3.5 py-2 rounded-xl text-xs flex items-center gap-1.5 transition ${
                    active ? 'bg-white text-slate-900 font-semibold shadow-sm' : 'text-slate-600 hover:text-slate-900 font-medium'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{nav.label}</span>
                </button>
              );
            })}
          </nav>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => setActiveTab('wallet')}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-amber-50 hover:bg-amber-100 border border-amber-200 text-amber-800 text-xs font-bold"
            >
              <Coins className="w-3.5 h-3.5 text-amber-500" />
              <span>{state.coins}</span>
            </button>
            <button
              onClick={() => setModalType('voice')}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-xs font-semibold shadow-sm"
            >
              <Mic className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">语音排期</span>
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-3 sm:px-6 pt-4 sm:pt-6">
        {activeTab === 'dashboard' && (
          <div className="space-y-5">
            <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-indigo-950 text-white rounded-3xl p-4 sm:p-5 shadow-md flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3.5">
                <div className="w-14 h-14 rounded-2xl bg-white/10 border border-white/15 flex flex-col items-center justify-center shrink-0">
                  <span className="text-lg font-extrabold tracking-tight text-amber-300">{hmStr}</span>
                  <span className="text-[10px] text-slate-300 font-mono">{secStr}</span>
                </div>
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-sm sm:text-base font-bold">{dateStr}</span>
                    <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-amber-400 text-slate-950">
                      第{currentTeachingWeek}周 · 2026-2027秋季学期
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 mt-1">
                    今日安排：{todayPlanSummary?.classes?.length ? todayPlanSummary.classes.join('、') : '全天无坐班课'} · {todayPlanSummary?.workout || '自主学习与健身'}
                  </p>
                </div>
              </div>

              <div className="bg-white/10 border border-white/15 rounded-2xl px-3.5 py-2.5 flex items-center gap-2.5 shrink-0">
                <span className="text-2xl">{weather.icon}</span>
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-sm font-extrabold">{weather.temp}°C</span>
                    <span className="text-xs text-slate-200">{weather.desc}</span>
                  </div>
                  <div className="text-[10px] text-slate-300 flex items-center gap-1 mt-0.5">
                    <MapPin className="w-3 h-3 text-rose-400" />
                    <span>{weather.loc}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
              <div className="bg-white rounded-3xl p-4 sm:p-5 border border-slate-200/70 shadow-sm">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] font-semibold text-slate-500">减脂净热量 (168cm)</span>
                  <Flame className="w-4 h-4 text-amber-500" />
                </div>
                <div className="flex items-baseline gap-1">
                  <span className="text-2xl font-bold text-slate-900">{totalNetCal}</span>
                  <span className="text-[11px] text-slate-400">/ {state.calories.target} kcal</span>
                </div>
                <div className="w-full bg-slate-100 h-1.5 rounded-full mt-2 overflow-hidden">
                  <div className="bg-amber-500 h-full rounded-full" style={{ width: `${Math.min(100, (totalNetCal / state.calories.target) * 100)}%` }} />
                </div>
                <p className="text-[11px] text-emerald-600 mt-1.5 font-medium">剩饭已扣 {totalSavedCal} kcal</p>
              </div>

              <div className="bg-white rounded-3xl p-4 sm:p-5 border border-slate-200/70 shadow-sm">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] font-semibold text-slate-500">体重管理 (BMI 21.6)</span>
                  <Scale className="w-4 h-4 text-emerald-600" />
                </div>
                <div className="flex items-baseline gap-1">
                  <span className="text-2xl font-bold text-slate-900">{latestWeight.toFixed(1)}</span>
                  <span className="text-[11px] text-slate-400">kg $\rightarrow$ 56.0kg</span>
                </div>
                <div className="mt-2 flex items-center gap-1.5">
                  <input
                    type="number"
                    step="0.1"
                    value={weightInput}
                    onChange={(e) => setWeightInput(e.target.value)}
                    placeholder="60.8"
                    className="w-16 text-xs px-2 py-1 rounded-xl border border-slate-200"
                  />
                  <button
                    onClick={() => {
                      const v = parseFloat(weightInput);
                      if (!v || v < 35 || v > 120) return;
                      setState((p) => ({ ...p, weights: [...p.weights.slice(-7), { date: '今日', val: v }] }));
                      setWeightInput('');
                      grantReward(15, 15, `体重 ${v}kg 已保存！`);
                    }}
                    className="text-[11px] px-2.5 py-1 rounded-xl bg-emerald-600 text-white font-semibold"
                  >
                    记录
                  </button>
                </div>
              </div>

              <div className="bg-white rounded-3xl p-4 sm:p-5 border border-slate-200/70 shadow-sm">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] font-semibold text-slate-500">本周 1/3/5 健身排期</span>
                  <Dumbbell className="w-4 h-4 text-rose-600" />
                </div>
                <div className="text-sm sm:text-base font-bold text-slate-900">18:10 下课顺路练</div>
                <p className="text-[11px] text-slate-500 mt-1">避开 14:00-17:40 下午连堂课</p>
                <button onClick={() => setActiveTab('fitness')} className="mt-2 text-[11px] font-semibold text-rose-600 hover:underline">
                  查看周课表与跟练 $\rightarrow$
                </button>
              </div>

              <div className="bg-white rounded-3xl p-4 sm:p-5 border border-slate-200/70 shadow-sm">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] font-semibold text-slate-500">本月省钱计划结余</span>
                  <PiggyBank className="w-4 h-4 text-purple-600" />
                </div>
                <div className="flex items-baseline gap-1">
                  <span className="text-2xl font-bold text-slate-900">¥{Math.round(savedMoney)}</span>
                  <span className="text-[11px] text-slate-400">结余 (支出¥{Math.round(totalSpent)})</span>
                </div>
                <button onClick={() => setActiveTab('wallet')} className="mt-2 text-[11px] font-semibold text-purple-600 hover:underline">
                  记收支 / 兑换奖励 $\rightarrow$
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
              <div className="lg:col-span-2 bg-white rounded-3xl p-5 sm:p-6 border border-slate-200/70 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h2 className="text-base sm:text-lg font-bold text-slate-900">第13周联动日程时间轴</h2>
                    <p className="text-xs text-slate-500 mt-0.5">适配 09:00起 - 01:30睡作息与连堂课程时段</p>
                  </div>
                  <button
                    onClick={() => setModalType('voice')}
                    className="text-xs px-3 py-1.5 rounded-xl bg-blue-50 text-blue-700 font-semibold flex items-center gap-1"
                  >
                    <Mic className="w-3.5 h-3.5" />语音调计划
                  </button>
                </div>
                <div className="space-y-2.5">
                  {state.schedules.map((item) => (
                    <div
                      key={item.id}
                      onClick={() => {
                        setState((prev) => ({
                          ...prev,
                          schedules: prev.schedules.map((s) => (s.id === item.id ? { ...s, done: !s.done } : s))
                        }));
                        if (!item.done) grantReward(15, 15, `完成「${item.title}」！`);
                      }}
                      className={`p-3 rounded-2xl border flex items-center justify-between gap-2.5 cursor-pointer transition ${
                        item.done ? 'bg-slate-50/70 border-slate-200/60 opacity-70' : 'bg-white border-slate-200 hover:border-blue-300'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className={`w-5 h-5 rounded-lg border-2 flex items-center justify-center shrink-0 ${item.done ? 'bg-emerald-500 border-emerald-500 text-white' : 'border-slate-300'}`}>
                          {item.done && <Check className="w-3 h-3" />}
                        </div>
                        <div className="min-w-0">
                          <div className="text-[11px] font-semibold text-slate-400">{item.time}</div>
                          <div className={`text-xs sm:text-sm font-bold truncate ${item.done ? 'line-through text-slate-400' : 'text-slate-800'}`}>{item.title}</div>
                        </div>
                      </div>
                      <span className="px-2 py-0.5 rounded-lg text-[10px] font-bold bg-slate-100 text-slate-700 shrink-0">{item.tag}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-5">
                <div className="bg-gradient-to-br from-amber-50 via-orange-50/70 to-yellow-50/60 rounded-3xl p-5 border border-amber-200/80 shadow-sm">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-bold text-amber-800 bg-amber-100/90 px-2.5 py-1 rounded-xl">陪伴激励宠物</span>
                    <div className="flex items-center gap-1 bg-white/80 p-1 rounded-xl border border-amber-200/70">
                      {[
                        { id: 'trilobite', name: '三叶虫·团子', emoji: '🪲' },
                        { id: 'ammonite', name: '菊石·螺螺', emoji: '🐚' },
                        { id: 'star', name: '星星·岩灵', emoji: '⭐' }
                      ].map((sp) => (
                        <button
                          key={sp.id}
                          onClick={() => setState((p) => ({ ...p, pet: { ...p.pet, species: sp.id, name: sp.name, emoji: sp.emoji } }))}
                          className="w-6 h-6 rounded-lg text-sm hover:bg-amber-100"
                        >
                          {sp.emoji}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="w-20 h-20 rounded-3xl bg-white shadow-sm border-2 border-amber-200 flex items-center justify-center text-4xl shrink-0">
                      {state.pet.emoji}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-bold text-slate-900 text-base">{state.pet.name}</h3>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500 text-white">Lv.{state.pet.level}</span>
                      </div>
                      <div className="mt-2">
                        <div className="flex justify-between text-[10px] font-semibold text-amber-800 mb-0.5">
                          <span>成长经验</span>
                          <span>{state.pet.exp} / {state.pet.maxExp} EXP</span>
                        </div>
                        <div className="w-full bg-amber-200/70 h-1.5 rounded-full overflow-hidden">
                          <div className="bg-amber-500 h-full rounded-full" style={{ width: `${Math.min(100, (state.pet.exp / state.pet.maxExp) * 100)}%` }} />
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-2 mt-4">
                    <button
                      onClick={() => notify('“168cm/61kg 已经是超棒的底子啦！18:10 下课后冲呀！”', 'success')}
                      className="py-2 rounded-xl bg-white hover:bg-amber-100 text-amber-900 border border-amber-200 text-xs font-bold flex items-center justify-center gap-1"
                    >
                      <Heart className="w-3.5 h-3.5 text-rose-500" />求夸夸
                    </button>
                    <button
                      onClick={() => {
                        if (state.pet.food <= 0) return notify('矿石不足，完成打卡掉落哦！', 'warning');
                        grantReward(5, 45, `投喂矿石成功！${state.pet.name} +45 EXP`, -1);
                      }}
                      className="py-2 rounded-xl bg-amber-500 text-white text-xs font-bold"
                    >
                      喂矿石({state.pet.food})
                    </button>
                    <button
                      onClick={() => grantReward(10, 10, '领取每日陪伴礼包：+10金币 & +1矿石！', 1)}
                      className="py-2 rounded-xl bg-emerald-600 text-white text-xs font-bold flex items-center justify-center gap-1"
                    >
                      <Gift className="w-3.5 h-3.5" />领礼包
                    </button>
                  </div>
                </div>

                <div className="bg-white rounded-3xl p-5 border border-slate-200/70 shadow-sm">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
                      <Bell className="w-4 h-4 text-rose-500" />
                      <span>课业与毕设强提醒</span>
                    </h3>
                    <button onClick={() => setModalType('ddl')} className="text-xs px-2.5 py-1 rounded-xl bg-slate-100 font-semibold">+ 新增</button>
                  </div>
                  <div className="space-y-2">
                    {state.ddls.map((d) => (
                      <div key={d.id} className="p-2.5 rounded-2xl bg-rose-50/70 border border-rose-200 flex items-center justify-between gap-2">
                        <div className="min-w-0">
                          <div className="text-xs font-bold text-rose-900 truncate">{d.title}</div>
                          <div className="text-[10px] text-rose-600 mt-0.5">{d.due}</div>
                        </div>
                        <button
                          onClick={() => {
                            setState((p) => ({ ...p, ddls: p.ddls.filter((item) => item.id !== d.id) }));
                            grantReward(20, 20, '搞定一项提醒！奖励 +20 金币！');
                          }}
                          className="p-1.5 rounded-lg bg-white border border-slate-200 text-emerald-600"
                        >
                          <Check className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'diet' && (
          <div className="space-y-5">
            <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200/70 shadow-sm">
              <div className="flex flex-wrap items-center justify-between gap-2 mb-5">
                <div>
                  <h2 className="text-lg font-bold text-slate-900">餐前餐后双图热量差值识别（168cm/61kg 精准减脂）</h2>
                  <p className="text-xs text-slate-500">餐前拍一张估算总热量，餐后拍一张扣除剩饭热量</p>
                </div>
                <span className="px-3 py-1 rounded-xl bg-emerald-50 text-emerald-700 text-xs font-bold">
                  今日剩饭已扣除 {totalSavedCal} kcal
                </span>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
                <div className="bg-slate-50 rounded-3xl p-4 border border-slate-200/80 space-y-3">
                  <div className="flex justify-between text-xs font-bold">
                    <span>STEP 1 · 餐前拍照</span>
                    <span className="text-amber-700">{preCal} kcal</span>
                  </div>
                  <label className="block h-40 rounded-2xl border-2 border-dashed border-slate-300 bg-white overflow-hidden cursor-pointer">
                    {preImg ? (
                      <img src={preImg} alt="餐前" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center text-slate-400 text-xs">
                        <Camera className="w-6 h-6 mb-1" />点击拍摄/上传餐前照片
                      </div>
                    )}
                    <input type="file" accept="image/*" className="hidden" onChange={(e) => handlePhotoUpload(e, 'pre')} />
                  </label>
                  <input type="text" value={preDesc} onChange={(e) => setPreDesc(e.target.value)} placeholder="食物描述（可选）" className="w-full text-xs px-3 py-2 rounded-xl border border-slate-200 bg-white" />
                  <div className="flex items-center justify-between text-xs">
                    <span>餐前热量 (kcal):</span>
                    <input
                      type="number"
                      value={preCal}
                      onChange={(e) => {
                        const v = Number(e.target.value) || 0;
                        setPreCal(v);
                        setPostCal(Math.round(v * (leftoverRatio / 100)));
                      }}
                      className="w-24 font-bold text-right px-2.5 py-1.5 rounded-xl border border-slate-200 bg-white"
                    />
                  </div>
                </div>

                <div className="bg-slate-50 rounded-3xl p-4 border border-slate-200/80 space-y-3">
                  <div className="flex justify-between text-xs font-bold">
                    <span>STEP 2 · 餐后残余对比</span>
                    <span className="text-emerald-700">-{postCal} kcal</span>
                  </div>
                  <label className="block h-40 rounded-2xl border-2 border-dashed border-slate-300 bg-white overflow-hidden cursor-pointer">
                    {postImg ? (
                      <img src={postImg} alt="餐后" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center text-slate-400 text-xs">
                        <Camera className="w-6 h-6 mb-1" />点击拍摄/上传餐后餐盘
                      </div>
                    )}
                    <input type="file" accept="image/*" className="hidden" onChange={(e) => handlePhotoUpload(e, 'post')} />
                  </label>
                  <div className="flex items-center gap-2 text-xs">
                    <span>剩余比例:</span>
                    <input
                      type="range"
                      min="0"
                      max="80"
                      value={leftoverRatio}
                      onChange={(e) => {
                        const r = Number(e.target.value);
                        setLeftoverRatio(r);
                        setPostCal(Math.round(preCal * (r / 100)));
                      }}
                      className="flex-1 accent-emerald-600"
                    />
                    <span className="font-bold text-emerald-700">{leftoverRatio}%</span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span>扣除热量 (kcal):</span>
                    <input
                      type="number"
                      value={postCal}
                      onChange={(e) => setPostCal(Number(e.target.value) || 0)}
                      className="w-24 font-bold text-right px-2.5 py-1.5 rounded-xl border border-slate-200 bg-white text-emerald-700"
                    />
                  </div>
                </div>

                <div className="bg-slate-900 text-white rounded-3xl p-5 flex flex-col justify-between">
                  <div>
                    <span className="text-xs font-bold text-amber-400">STEP 3 · 净摄入结算</span>
                    <div className="mt-3 flex items-baseline gap-2">
                      <span className="text-4xl font-extrabold">{Math.max(0, preCal - postCal)}</span>
                      <span className="text-xs text-slate-300">kcal 实际摄入</span>
                    </div>
                    <p className="text-xs text-slate-300 mt-3 bg-white/10 p-3 rounded-2xl">
                      扣除剩饭热量后写入账本，每次记录自动奖励 <strong>+20 自律金币</strong>！
                    </p>
                  </div>
                  <div className="mt-4 space-y-2">
                    <select value={mealType} onChange={(e) => setMealType(e.target.value)} className="w-full text-xs bg-white/10 border border-white/20 rounded-xl px-3 py-2 text-white">
                      <option value="午餐 (12:30)" className="text-slate-900">午餐 (12:30)</option>
                      <option value="晚餐 (18:30)" className="text-slate-900">晚餐 (18:30)</option>
                      <option value="早午餐 (09:30)" className="text-slate-900">早午餐 (09:30)</option>
                    </select>
                    <button onClick={commitMeal} className="w-full py-2.5 rounded-2xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs">
                      写入热量账本 (+20金币)
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200/70 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-base font-bold text-slate-900">今日饮食热量明细（记错了可随时修改或删除）</h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    当前累计净摄入 <strong className="text-slate-800">{totalNetCal} kcal</strong> / 目标 {state.calories.target} kcal（剩余 {Math.max(0, state.calories.target - totalNetCal)} kcal）
                  </p>
                </div>
              </div>

              {state.calories.meals.length === 0 ? (
                <div className="text-center py-8 text-xs text-slate-400 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                  今日暂未记录任何饮食，上方结算后会自动出现在这里~
                </div>
              ) : (
                <div className="space-y-2.5">
                  {state.calories.meals.map((meal) => (
                    <div
                      key={meal.id}
                      className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 flex flex-wrap sm:flex-nowrap items-center justify-between gap-3"
                    >
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-slate-900">{meal.type}</span>
                          <span className="text-[11px] text-slate-400">{meal.time}</span>
                        </div>
                        <div className="text-xs text-slate-600 truncate mt-0.5">{meal.desc || '未填写餐食描述'}</div>
                      </div>

                      <div className="flex items-center gap-3 shrink-0">
                        <div className="text-right">
                          <div className="text-sm font-extrabold text-slate-900">{meal.netCal} kcal</div>
                          <div className="text-[10px] text-emerald-600">
                            餐前 {meal.preCal} - 剩 {meal.leftoverCal}
                          </div>
                        </div>
                        <button
                          onClick={() => {
                            setEditMealForm({
                              id: meal.id,
                              type: meal.type,
                              desc: meal.desc || '',
                              preCal: meal.preCal,
                              leftoverCal: meal.leftoverCal
                            });
                            setModalType('editMeal');
                          }}
                          className="px-2.5 py-1.5 rounded-xl bg-white hover:bg-amber-50 text-amber-700 border border-slate-200 hover:border-amber-300 text-xs font-bold flex items-center gap-1 transition"
                        >
                          <Pencil className="w-3 h-3" />修改
                        </button>
                        <button
                          onClick={() => {
                            setState((prev) => ({
                              ...prev,
                              calories: {
                                ...prev.calories,
                                meals: prev.calories.meals.filter((m) => m.id !== meal.id)
                              }
                            }));
                            notify('已删除该条饮食记录，今日总热量已同步重算', 'info');
                          }}
                          className="p-1.5 rounded-xl bg-white hover:bg-rose-50 text-slate-400 hover:text-rose-600 border border-slate-200 hover:border-rose-200 transition"
                          title="删除记录"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'fitness' && (
          <div className="space-y-5">
            <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200/70 shadow-sm space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h2 className="text-lg font-bold text-slate-900">每周课表同步 (202319203061) & 弹性健身联动</h2>
                  <p className="text-xs text-slate-500">点击任意一天右上角的「编辑」可自由修改课程与健身安排</p>
                </div>
                <select
                  value={selectedWeek}
                  onChange={(e) => handleWeekChange(e.target.value)}
                  className="text-xs px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 font-semibold"
                >
                  <option value="week13">第13周 (11.23周一起 · 多媒体设计2 + 毕设)</option>
                  <option value="week14_15">第14-15周 (学科综合设计二 + 多媒体设计2)</option>
                  <option value="week16_19">第16-19周 (公共空间营造 · 裴磊)</option>
                </select>
              </div>

              <div className="flex flex-wrap items-center gap-2 pb-3 border-b border-slate-100">
                <span className="text-xs font-semibold text-slate-500">健身方案调整：</span>
                <button
                  onClick={() => applyFitnessMode('normal')}
                  className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-rose-600 text-white shadow-sm hover:bg-rose-700 transition"
                >
                  1/3/5 18:10 下课顺路练
                </button>
                <button
                  onClick={() => applyFitnessMode('shift')}
                  className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-amber-100 text-amber-800 hover:bg-amber-200 transition"
                >
                  毕设冲突 $\rightarrow$ 平移周四/六
                </button>
                <button
                  onClick={() => applyFitnessMode('dorm')}
                  className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-indigo-100 text-indigo-800 hover:bg-indigo-200 transition"
                >
                  室内宿舍35m跟练方案
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-7 gap-3">
                {state.weekPlan.map((d, idx) => (
                  <div key={d.day} className={`p-3.5 rounded-2xl border flex flex-col justify-between ${d.isWorkout ? 'bg-rose-50/50 border-rose-200' : 'bg-slate-50/70 border-slate-200/70'}`}>
                    <div>
                      <div className="flex items-center justify-between gap-1 mb-2">
                        <span className="font-bold text-sm text-slate-900">{d.day}</span>
                        <div className="flex items-center gap-1">
                          <span className={`px-2 py-0.5 rounded-lg text-[10px] font-bold ${d.isWorkout ? 'bg-rose-500 text-white' : 'bg-slate-200 text-slate-600'}`}>
                            {d.isWorkout ? '训练日' : '自由'}
                          </span>
                          <button
                            onClick={() => {
                              setEditDayForm({
                                idx,
                                day: d.day,
                                classesText: d.classes.join('\n'),
                                workout: d.workout,
                                isWorkout: d.isWorkout
                              });
                              setModalType('editDay');
                            }}
                            title="自由编辑当日课表与健身"
                            className="p-1 rounded-lg bg-white hover:bg-slate-100 border border-slate-200 text-slate-500 hover:text-slate-900 transition"
                          >
                            <Pencil className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                      <div className="space-y-1 mb-2.5">
                        {d.classes.length ? d.classes.map((c, i) => (
                          <div key={i} className="text-[11px] bg-white px-2 py-1 rounded-lg border border-slate-200 text-slate-700">
                            <GraduationCap className="w-3 h-3 inline mr-1 text-blue-500" />{c}
                          </div>
                        )) : <div className="text-[11px] text-emerald-600 font-medium">全天无课</div>}
                      </div>
                    </div>
                    <div className="pt-2 border-t border-slate-200/60">
                      <div className={`text-xs font-bold mb-2 ${d.isWorkout ? 'text-rose-700' : 'text-slate-600'}`}>{d.workout}</div>
                      <button
                        onClick={() => {
                          const next = state.weekPlan.map((item, i) => (i === idx ? { ...item, done: !item.done } : item));
                          setState((p) => ({ ...p, weekPlan: next }));
                          if (!d.done) grantReward(35, 30, `完成${d.day}训练打卡！+35金币 & +1矿石`, 1);
                        }}
                        className={`w-full py-1.5 rounded-xl text-[11px] font-bold ${d.done ? 'bg-emerald-600 text-white' : 'bg-white border border-slate-200 text-slate-700'}`}
                      >
                        {d.done ? '已打卡 (+35金币)' : '完成打卡'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200/70 shadow-sm">
              <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
                <div>
                  <h3 className="text-base sm:text-lg font-bold text-slate-900">168cm · 61kg 专属减脂塑形与室内跟练教程指南</h3>
                  <p className="text-xs text-slate-500 mt-0.5">内置分部位动作组数，支持健身房器械与室内宿舍跟练一键跳转 B站 视频</p>
                </div>
                <span className="px-3 py-1 rounded-xl bg-rose-50 text-rose-700 text-xs font-bold">每次 35-55 分钟 · 燃脂约 350 kcal</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="p-4 rounded-2xl bg-gradient-to-b from-rose-50/80 to-white border border-rose-200/80 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="px-2.5 py-0.5 rounded-lg bg-rose-600 text-white text-xs font-bold">周一 · 美背直角肩</span>
                      <span className="text-[11px] text-slate-500">55 mins</span>
                    </div>
                    <ul className="text-xs text-slate-700 space-y-2 mt-3">
                      <li className="flex items-start gap-1.5"><span className="font-bold text-rose-600">01</span><span><strong>宽握高位下拉</strong>：4组 × 15次（改善圆肩穿衣显薄）</span></li>
                      <li className="flex items-start gap-1.5"><span className="font-bold text-rose-600">02</span><span><strong>坐姿划船</strong>：4组 × 15次（收紧中背部线条）</span></li>
                      <li className="flex items-start gap-1.5"><span className="font-bold text-rose-600">03</span><span><strong>哑铃侧平举+绳索下压</strong>：各3组 × 15次（紧致手臂）</span></li>
                      <li className="flex items-start gap-1.5"><span className="font-bold text-rose-600">04</span><span><strong>跑步机爬坡</strong>：坡度12 / 速度4.8 / 25分钟</span></li>
                    </ul>
                  </div>
                  <a
                    href="https://search.bilibili.com/all?keyword=女生健身房背肩训练入门跟练"
                    target="_blank"
                    rel="noreferrer"
                    className="mt-4 w-full py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold text-center transition block"
                  >
                    📺 B站美背直角肩跟练直达
                  </a>
                </div>

                <div className="p-4 rounded-2xl bg-gradient-to-b from-amber-50/80 to-white border border-amber-200/80 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="px-2.5 py-0.5 rounded-lg bg-amber-600 text-white text-xs font-bold">周三 · 蜜桃臀腿不粗腿</span>
                      <span className="text-[11px] text-slate-500">55 mins</span>
                    </div>
                    <ul className="text-xs text-slate-700 space-y-2 mt-3">
                      <li className="flex items-start gap-1.5"><span className="font-bold text-amber-600">01</span><span><strong>哑铃高脚杯深蹲</strong>：4组 × 12次（调动大肌群燃脂）</span></li>
                      <li className="flex items-start gap-1.5"><span className="font-bold text-amber-600">02</span><span><strong>罗马尼亚硬拉</strong>：4组 × 15次（提升臀线紧致腿后侧）</span></li>
                      <li className="flex items-start gap-1.5"><span className="font-bold text-amber-600">03</span><span><strong>坐姿髋外展机</strong>：4组 × 20次（改善臀凹陷）</span></li>
                      <li className="flex items-start gap-1.5"><span className="font-bold text-amber-600">04</span><span><strong>椭圆机变速有氧</strong>：阻力6 / 25分钟（护膝刷脂）</span></li>
                    </ul>
                  </div>
                  <a
                    href="https://search.bilibili.com/all?keyword=女生健身房臀腿塑形不粗腿教程"
                    target="_blank"
                    rel="noreferrer"
                    className="mt-4 w-full py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold text-center transition block"
                  >
                    📺 B站臀腿塑形不粗腿直达
                  </a>
                </div>

                <div className="p-4 rounded-2xl bg-gradient-to-b from-indigo-50/80 to-white border border-indigo-200/80 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="px-2.5 py-0.5 rounded-lg bg-indigo-600 text-white text-xs font-bold">周五 · 核心马甲线</span>
                      <span className="text-[11px] text-slate-500">50 mins</span>
                    </div>
                    <ul className="text-xs text-slate-700 space-y-2 mt-3">
                      <li className="flex items-start gap-1.5"><span className="font-bold text-indigo-600">01</span><span><strong>卷腹+反向卷腹超级组</strong>：4组 × 15次（上下腹雕刻）</span></li>
                      <li className="flex items-start gap-1.5"><span className="font-bold text-indigo-600">02</span><span><strong>平板支撑+俄罗斯转体</strong>：3组 × 45秒（收紧腰围）</span></li>
                      <li className="flex items-start gap-1.5"><span className="font-bold text-indigo-600">03</span><span><strong>壶铃摇摆间歇</strong>：4组 × 30秒（快速拉高心率）</span></li>
                      <li className="flex items-start gap-1.5"><span className="font-bold text-indigo-600">04</span><span><strong>全套泡沫轴放松拉伸</strong>：15分钟（消除水肿）</span></li>
                    </ul>
                  </div>
                  <a
                    href="https://search.bilibili.com/all?keyword=15分钟高效马甲线核心训练跟练"
                    target="_blank"
                    rel="noreferrer"
                    className="mt-4 w-full py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold text-center transition block"
                  >
                    📺 B站马甲线核心训练直达
                  </a>
                </div>

                <div className="p-4 rounded-2xl bg-gradient-to-b from-emerald-50/80 to-white border border-emerald-200/80 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="px-2.5 py-0.5 rounded-lg bg-emerald-600 text-white text-xs font-bold">室内宿舍 · 居家燃脂</span>
                      <span className="text-[11px] text-slate-500">35 mins</span>
                    </div>
                    <ul className="text-xs text-slate-700 space-y-2 mt-3">
                      <li className="flex items-start gap-1.5"><span className="font-bold text-emerald-600">01</span><span><strong>帕梅拉/周六野热身+开合跳</strong>：4组 × 40秒</span></li>
                      <li className="flex items-start gap-1.5"><span className="font-bold text-emerald-600">02</span><span><strong>自重深蹲+弓箭步蹲</strong>：4组 × 16次（宿舍瑜伽垫可做）</span></li>
                      <li className="flex items-start gap-1.5"><span className="font-bold text-emerald-600">03</span><span><strong>跪姿俯卧撑+W字背部伸展</strong>：3组 × 15次（瘦背消副乳）</span></li>
                      <li className="flex items-start gap-1.5"><span className="font-bold text-emerald-600">04</span><span><strong>死虫式+仰卧单车</strong>：3组 × 40秒（紧致小腹）</span></li>
                    </ul>
                  </div>
                  <a
                    href="https://search.bilibili.com/all?keyword=周六野室内无跳跃燃脂跟练"
                    target="_blank"
                    rel="noreferrer"
                    className="mt-4 w-full py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold text-center transition block"
                  >
                    📺 B站室内宿舍跟练直达
                  </a>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'wallet' && (
          <div className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white p-5 rounded-3xl border border-slate-200/70 shadow-sm">
                <div className="flex justify-between text-xs text-slate-500 mb-1">
                  <span>本月支出 / 预算+收入</span>
                  <button onClick={() => setModalType('budget')} className="text-purple-600 font-semibold hover:underline">修改预算</button>
                </div>
                <div className="text-2xl font-extrabold text-slate-900">
                  ¥{totalSpent.toFixed(1)}{' '}
                  <span className="text-xs font-normal text-slate-400">
                    / ¥{(state.wallet.budget + totalIncome).toFixed(0)} {totalIncome > 0 ? `(含收入¥${totalIncome.toFixed(0)})` : ''}
                  </span>
                </div>
                <div className="w-full bg-slate-100 h-2 rounded-full mt-3 overflow-hidden">
                  <div
                    className="bg-purple-600 h-full rounded-full"
                    style={{ width: `${Math.min(100, (totalSpent / Math.max(1, state.wallet.budget + totalIncome)) * 100)}%` }}
                  />
                </div>
              </div>

              <div className="bg-emerald-50/70 p-5 rounded-3xl border border-emerald-200/80">
                <div className="flex items-center justify-between text-xs text-emerald-800 font-semibold mb-1">
                  <span>本月省钱净结余</span>
                  <span className="text-emerald-700 font-bold">累计收入 +¥{totalIncome.toFixed(1)}</span>
                </div>
                <div className="text-2xl font-extrabold text-emerald-700">¥{savedMoney.toFixed(1)}</div>
                <button
                  onClick={() => grantReward(30, 20, '忍住冲动消费！奖励 +30 自律金币！')}
                  className="mt-3 w-full py-2 rounded-xl bg-emerald-600 text-white text-xs font-bold"
                >
                  + 我忍住没买奶茶/盲盒 (+30金币)
                </button>
              </div>

              <div className="bg-gradient-to-br from-amber-500 to-orange-500 text-white p-5 rounded-3xl shadow-sm">
                <div className="flex justify-between text-xs text-amber-100 mb-1">
                  <span>我的自律奖励金库</span>
                  <Trophy className="w-4 h-4" />
                </div>
                <div className="text-3xl font-extrabold">{state.coins} <span className="text-xs font-normal">金币</span></div>
                <p className="text-[11px] text-amber-50 mt-2">达标就理直气壮兑换下面的自我奖励！</p>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
              <div className="bg-white rounded-3xl p-5 border border-slate-200/70 shadow-sm">
                <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
                  <h3 className="font-bold text-slate-900">收支流水明细（可修改/删除）</h3>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        setExpenseForm({ kind: 'income', title: '', amount: '500.0', category: '奖学金/兼职' });
                        setModalType('expense');
                      }}
                      className="text-xs px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold"
                    >
                      + 记收入
                    </button>
                    <button
                      onClick={() => {
                        setExpenseForm({ kind: 'expense', title: '', amount: '15.0', category: '健康餐饮' });
                        setModalType('expense');
                      }}
                      className="text-xs px-3 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold"
                    >
                      + 记支出
                    </button>
                  </div>
                </div>
                {state.wallet.expenses.length === 0 ? (
                  <div className="text-center py-8 text-xs text-slate-400 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                    暂无收支流水，点击上方「+ 记收入」或「+ 记支出」开始记录~
                  </div>
                ) : (
                  <div className="space-y-2 max-h-72 overflow-y-auto">
                    {state.wallet.expenses.map((e) => {
                      const isInc = e.kind === 'income';
                      return (
                        <div key={e.id} className="p-3 rounded-2xl bg-slate-50 border border-slate-200/70 flex items-center justify-between gap-2 text-xs">
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-1.5">
                              <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${isInc ? 'bg-emerald-100 text-emerald-700' : 'bg-purple-100 text-purple-700'}`}>
                                {isInc ? '收入' : '支出'}
                              </span>
                              <span className="font-bold text-slate-800 truncate">{e.title}</span>
                            </div>
                            <div className="text-[10px] text-slate-400 mt-0.5">{e.category} · {e.date}</div>
                          </div>
                          <div className="flex items-center gap-2 shrink-0">
                            <span className={`font-extrabold ${isInc ? 'text-emerald-600' : 'text-slate-900'}`}>
                              {isInc ? '+' : '-'}¥{e.amount.toFixed(1)}
                            </span>
                            <button
                              onClick={() => {
                                setEditTxForm({
                                  id: e.id,
                                  kind: e.kind || 'expense',
                                  title: e.title,
                                  amount: String(e.amount),
                                  category: e.category
                                });
                                setModalType('editTx');
                              }}
                              className="p-1.5 rounded-lg bg-white hover:bg-amber-50 border border-slate-200 text-slate-500 hover:text-amber-700"
                              title="修改记录"
                            >
                              <Pencil className="w-3 h-3" />
                            </button>
                            <button
                              onClick={() => {
                                setState((p) => ({
                                  ...p,
                                  wallet: {
                                    ...p.wallet,
                                    expenses: p.wallet.expenses.filter((item) => item.id !== e.id)
                                  }
                                }));
                                notify('已删除该条收支记录', 'info');
                              }}
                              className="p-1.5 rounded-lg bg-white hover:bg-rose-50 border border-slate-200 text-slate-400 hover:text-rose-600"
                              title="删除记录"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              <div className="bg-white rounded-3xl p-5 border border-slate-200/70 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-bold text-slate-900">自我奖励兑换商店</h3>
                  <button onClick={() => setModalType('reward')} className="text-xs px-3 py-1.5 rounded-xl bg-amber-100 text-amber-900 font-bold">+ 自定义奖励</button>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {state.wallet.rewards.map((r) => (
                    <div key={r.id} className="p-3.5 rounded-2xl border border-amber-200 bg-amber-50/50 flex flex-col justify-between">
                      <div>
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-2xl">{r.icon}</span>
                          <span className="text-[10px] text-slate-400">已兑 {r.redeemed} 次</span>
                        </div>
                        <div className="text-xs font-bold text-slate-900">{r.title}</div>
                      </div>
                      <button
                        onClick={() => {
                          if (state.coins < r.cost) return notify(`金币还差 ${r.cost - state.coins} 枚哦！`, 'warning');
                          setState((p) => ({
                            ...p,
                            coins: p.coins - r.cost,
                            wallet: {
                              ...p.wallet,
                              rewards: p.wallet.rewards.map((item) => (item.id === r.id ? { ...item, redeemed: item.redeemed + 1 } : item))
                            }
                          }));
                          notify(`🎉 成功兑换「${r.title}」！`, 'success');
                        }}
                        className="mt-3 w-full py-1.5 rounded-xl bg-amber-500 text-white text-xs font-bold"
                      >
                        {r.cost} 金币兑换
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'bookshelf' && (
          <div className="space-y-5">
            <div className="bg-white rounded-3xl p-5 border border-slate-200/70 shadow-sm flex flex-wrap items-center justify-between gap-4">
              <div>
                <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-xl">真实阅读时长统计（已清零虚构数据）</span>
                <div className="mt-2 flex items-baseline gap-4">
                  <div className="text-2xl font-extrabold text-slate-900">{(state.readingStats.totalSeconds / 3600).toFixed(1)} <span className="text-xs font-normal text-slate-500">小时</span></div>
                  <div className="text-sm font-bold text-emerald-600">连续打卡 {state.readingStats.streakDays} 天</div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="relative">
                  <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
                  <input
                    type="text"
                    value={bookSearch}
                    onChange={(e) => setBookSearch(e.target.value)}
                    placeholder="搜索或新建书目..."
                    className="pl-8 pr-3 py-2 rounded-xl border border-slate-200 text-xs w-44"
                  />
                </div>
                <button onClick={() => setModalType('addBook')} className="px-3.5 py-2 rounded-xl bg-indigo-600 text-white text-xs font-bold flex items-center gap-1">
                  <Plus className="w-3.5 h-3.5" />录入新书
                </button>
              </div>
            </div>

            <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200/70 shadow-sm">
              <div className="flex items-center gap-2 overflow-x-auto pb-3 mb-4 border-b border-slate-100">
                <button
                  onClick={() => setBookCat('all')}
                  className={`px-3 py-1.5 rounded-xl text-xs whitespace-nowrap ${bookCat === 'all' ? 'bg-indigo-600 text-white font-semibold' : 'bg-slate-100 text-slate-600'}`}
                >
                  全部藏书 ({state.books.length})
                </button>
                {state.bookCategories.map((cat) => (
                  <div key={cat} className={`inline-flex items-center rounded-xl overflow-hidden shrink-0 ${bookCat === cat ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-700'}`}>
                    <button onClick={() => setBookCat(cat)} className="px-3 py-1.5 text-xs font-medium">{cat}</button>
                    <button
                      onClick={() => {
                        setState((p) => ({
                          ...p,
                          bookCategories: p.bookCategories.filter((c) => c !== cat),
                          books: p.books.map((b) => (b.category === cat ? { ...b, category: '未分类' } : b))
                        }));
                        if (bookCat === cat) setBookCat('all');
                        notify(`已删除分类「${cat}」`, 'info');
                      }}
                      className="pr-2 pl-1 py-1.5 text-[10px] opacity-60 hover:opacity-100"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
                <button
                  onClick={() => setModalType('newCat')}
                  className="px-3 py-1.5 rounded-xl text-xs font-bold bg-indigo-50 text-indigo-700 border border-indigo-200 flex items-center gap-1 shrink-0"
                >
                  <FolderPlus className="w-3.5 h-3.5" />新建分类
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {state.books
                  .filter((b) => (bookCat === 'all' || b.category === bookCat) && (b.title.toLowerCase().includes(bookSearch.toLowerCase()) || b.author.toLowerCase().includes(bookSearch.toLowerCase())))
                  .map((book) => (
                    <div
                      key={book.id}
                      onClick={() => handleOpenBook(book)}
                      className="bg-slate-50 hover:bg-white rounded-3xl p-4 border border-slate-200/80 hover:border-indigo-300 transition cursor-pointer flex flex-col justify-between"
                    >
                      <div>
                        <div className={`h-32 rounded-2xl bg-gradient-to-br ${book.coverBg} p-3.5 text-white flex flex-col justify-between shadow-sm`}>
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] font-bold bg-black/25 px-2 py-0.5 rounded-lg">{book.category}</span>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setState((p) => ({ ...p, books: p.books.filter((item) => item.id !== book.id) }));
                                notify(`已删除《${book.title}》`, 'info');
                              }}
                              className="w-6 h-6 rounded-lg bg-black/25 hover:bg-rose-600 flex items-center justify-center"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>
                          <h4 className="font-bold text-xs sm:text-sm line-clamp-2">{book.title}</h4>
                        </div>
                        <div className="mt-2.5 text-[11px] text-slate-500">
                          <div>{book.author}</div>
                          <div className="flex justify-between mt-1.5">
                            <span>已读 {book.readMins}m</span>
                            <span className="font-bold text-indigo-600">{book.progress}%</span>
                          </div>
                          <div className="w-full bg-slate-200 h-1.5 rounded-full mt-1 overflow-hidden">
                            <div className="bg-indigo-600 h-full rounded-full" style={{ width: `${book.progress}%` }} />
                          </div>
                        </div>
                      </div>
                      <div className="mt-2.5 pt-2 border-t border-slate-200/60 text-xs font-bold text-indigo-600">
                        打开内置全屏阅读器 $\rightarrow$
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'academic' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            <div className="lg:col-span-2 space-y-5">
              <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200/70 shadow-sm">
                <h2 className="text-lg font-bold text-slate-900 mb-4">多线学习打卡（雅思 / 日语 / 地大黄爱武老师方向）</h2>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                  {[
                    { title: '雅思英语 IELTS', desc: '核心词 50 个 + 真题精听', coins: 25, bg: 'bg-sky-50 border-sky-200 text-sky-800', btn: 'bg-sky-600' },
                    { title: '日语进阶 Japanese', desc: '新标日 1 课 + 生肉跟读', coins: 25, bg: 'bg-rose-50 border-rose-200 text-rose-800', btn: 'bg-rose-600' },
                    { title: '地大预研 & 古生物', desc: '工程地质文献 + 科普笔记', coins: 35, bg: 'bg-emerald-50 border-emerald-200 text-emerald-800', btn: 'bg-emerald-600' }
                  ].map((item) => (
                    <div key={item.title} className={`p-4 rounded-2xl border ${item.bg}`}>
                      <div className="text-xs font-bold mb-1">{item.title}</div>
                      <p className="text-xs text-slate-600 mb-3">{item.desc}</p>
                      <button
                        onClick={() => grantReward(item.coins, item.coins, `完成「${item.title}」打卡！+${item.coins}金币`, 1)}
                        className={`w-full py-2 rounded-xl ${item.btn} text-white text-xs font-bold`}
                      >
                        打卡 (+{item.coins}金币)
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <ThreeLabViewer />
          </div>
        )}
      </main>

      <nav className="lg:hidden fixed bottom-0 inset-x-0 z-30 bg-white/95 backdrop-blur-md border-t border-slate-200 px-1 py-1.5 flex items-center justify-around">
        {[
          { id: 'dashboard', label: '总览', icon: Compass },
          { id: 'diet', label: '饮食', icon: Camera },
          { id: 'fitness', label: '课表健身', icon: Dumbbell },
          { id: 'wallet', label: '省钱奖励', icon: Wallet },
          { id: 'bookshelf', label: '书架', icon: BookOpen },
          { id: 'academic', label: '科研3D', icon: Box }
        ].map((nav) => {
          const Icon = nav.icon;
          const active = activeTab === nav.id;
          return (
            <button
              key={nav.id}
              onClick={() => setActiveTab(nav.id)}
              className={`flex flex-col items-center gap-0.5 px-2 py-1 rounded-xl ${active ? 'text-blue-600 font-bold' : 'text-slate-500'}`}
            >
              <Icon className="w-4 h-4" />
              <span className="text-[10px]">{nav.label}</span>
            </button>
          );
        })}
      </nav>

      {modalType && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-900">
                {modalType === 'voice' && '语音一句话调计划与记账'}
                {modalType === 'expense' && (expenseForm.kind === 'income' ? '记一笔收入进账' : '记一笔消费花销')}
                {modalType === 'editTx' && '修改收支记录'}
                {modalType === 'editDay' && `自由编辑 · ${editDayForm.day}`}
                {modalType === 'budget' && '修改本月预算目标'}
                {modalType === 'reward' && '上架专属自我奖励'}
                {modalType === 'newCat' && '新建私人书架分类'}
                {modalType === 'addBook' && '录入新书或导入完整电子书'}
                {modalType === 'ddl' && '新增课业强提醒'}
                {modalType === 'backup' && 'React + Three.js 独立存档备份'}
                {modalType === 'editMeal' && '修改饮食热量记录'}
              </h3>
              <button
                onClick={() => {
                  if (recognitionRef.current && isListeningVoice) recognitionRef.current.stop();
                  setModalType(null);
                }}
                className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {modalType === 'voice' && (
              <div className="space-y-3 text-xs">
                <div className="flex flex-col items-center justify-center py-3 bg-slate-50 rounded-2xl border border-slate-200">
                  <button
                    type="button"
                    onClick={toggleVoiceMic}
                    className={`w-12 h-12 rounded-full text-white flex items-center justify-center shadow-md transition ${
                      isListeningVoice ? 'bg-rose-600 animate-pulse' : 'bg-blue-600 hover:bg-blue-700'
                    }`}
                  >
                    <Mic className="w-5 h-5" />
                  </button>
                  <span className="text-[11px] font-semibold text-slate-600 mt-2">
                    {isListeningVoice ? '正在聆听语音，请直接说话...' : '点击麦克风直接说话，或在下方直接输入'}
                  </span>
                </div>
                <textarea
                  rows={3}
                  value={voiceText}
                  onChange={(e) => {
                    voiceTextRef.current = e.target.value;
                    setVoiceText(e.target.value);
                  }}
                  placeholder="可直接说话或输入：把今天雅思改到晚上九点，周一健身调到周二，取消睡前阅读，食堂花了14.5元..."
                  className="w-full p-3 rounded-2xl border border-slate-200 focus:outline-none focus:border-blue-500"
                />
                <button
                  type="button"
                  onClick={() => {
                    const sample = '把今天的雅思学习改到晚上九点，把周一的健身调到周二，另外取消睡前阅读，食堂花了14.5元';
                    voiceTextRef.current = sample;
                    setVoiceText(sample);
                  }}
                  className="text-[11px] px-2.5 py-1.5 rounded-xl bg-blue-50 text-blue-700 text-left"
                >
                  点击填入示例指令（可选）
                </button>
                <button
                  type="button"
                  onClick={() => applyVoicePlan()}
                  className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold"
                >
                  AI 自动调计划并执行
                </button>
              </div>
            )}

            {modalType === 'expense' && (
              <div className="space-y-3 text-xs">
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setExpenseForm({ ...expenseForm, kind: 'expense', category: '健康餐饮' })}
                    className={`py-2 rounded-xl font-bold border ${expenseForm.kind === 'expense' ? 'bg-purple-600 text-white border-purple-600' : 'bg-slate-50 text-slate-600 border-slate-200'}`}
                  >
                    支出花销
                  </button>
                  <button
                    type="button"
                    onClick={() => setExpenseForm({ ...expenseForm, kind: 'income', category: '奖学金/兼职' })}
                    className={`py-2 rounded-xl font-bold border ${expenseForm.kind === 'income' ? 'bg-emerald-600 text-white border-emerald-600' : 'bg-slate-50 text-slate-600 border-slate-200'}`}
                  >
                    收入进账
                  </button>
                </div>
                <input
                  type="text"
                  placeholder={expenseForm.kind === 'income' ? '收入来源（如：研究生补助/兼职/生活费）' : '消费项目（如：黄家湖二食堂晚餐）'}
                  value={expenseForm.title}
                  onChange={(e) => setExpenseForm({ ...expenseForm, title: e.target.value })}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200"
                />
                <input
                  type="number"
                  step="0.1"
                  placeholder="金额（元）"
                  value={expenseForm.amount}
                  onChange={(e) => setExpenseForm({ ...expenseForm, amount: e.target.value })}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200"
                />
                <select
                  value={expenseForm.category}
                  onChange={(e) => setExpenseForm({ ...expenseForm, category: e.target.value })}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-white"
                >
                  {(expenseForm.kind === 'income'
                    ? ['奖学金/兼职', '家人生活费', '闲置变现', '其他收入']
                    : ['健康餐饮', '书籍学习', '健身运动', '日用服饰', '零食饮料']
                  ).map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
                <button
                  onClick={() => {
                    const amt = parseFloat(expenseForm.amount);
                    if (!expenseForm.title.trim() || !amt || amt <= 0) return;
                    setState((p) => ({
                      ...p,
                      wallet: {
                        ...p.wallet,
                        expenses: [
                          {
                            id: Date.now(),
                            kind: expenseForm.kind,
                            title: expenseForm.title.trim(),
                            amount: amt,
                            category: expenseForm.category,
                            date: '刚刚'
                          },
                          ...p.wallet.expenses
                        ]
                      }
                    }));
                    setExpenseForm({ kind: 'expense', title: '', amount: '15.0', category: '健康餐饮' });
                    setModalType(null);
                    notify(
                      expenseForm.kind === 'income'
                        ? `已记录收入 +¥${amt.toFixed(1)}，结余已增加！`
                        : `已记录支出 -¥${amt.toFixed(1)}`,
                      'success'
                    );
                  }}
                  className={`w-full py-2.5 rounded-xl text-white font-bold ${expenseForm.kind === 'income' ? 'bg-emerald-600' : 'bg-purple-600'}`}
                >
                  确认保存
                </button>
              </div>
            )}

            {modalType === 'editTx' && (
              <div className="space-y-3 text-xs">
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setEditTxForm({ ...editTxForm, kind: 'expense' })}
                    className={`py-2 rounded-xl font-bold border ${editTxForm.kind === 'expense' ? 'bg-purple-600 text-white border-purple-600' : 'bg-slate-50 text-slate-600 border-slate-200'}`}
                  >
                    支出
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditTxForm({ ...editTxForm, kind: 'income' })}
                    className={`py-2 rounded-xl font-bold border ${editTxForm.kind === 'income' ? 'bg-emerald-600 text-white border-emerald-600' : 'bg-slate-50 text-slate-600 border-slate-200'}`}
                  >
                    收入
                  </button>
                </div>
                <input
                  type="text"
                  value={editTxForm.title}
                  onChange={(e) => setEditTxForm({ ...editTxForm, title: e.target.value })}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200"
                />
                <input
                  type="number"
                  step="0.1"
                  value={editTxForm.amount}
                  onChange={(e) => setEditTxForm({ ...editTxForm, amount: e.target.value })}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 font-bold"
                />
                <input
                  type="text"
                  value={editTxForm.category}
                  onChange={(e) => setEditTxForm({ ...editTxForm, category: e.target.value })}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200"
                />
                <button
                  onClick={() => {
                    const amt = parseFloat(editTxForm.amount);
                    if (!editTxForm.title.trim() || !amt || amt <= 0) return;
                    setState((p) => ({
                      ...p,
                      wallet: {
                        ...p.wallet,
                        expenses: p.wallet.expenses.map((item) =>
                          item.id === editTxForm.id
                            ? { ...item, kind: editTxForm.kind, title: editTxForm.title.trim(), amount: amt, category: editTxForm.category }
                            : item
                        )
                      }
                    }));
                    setModalType(null);
                    notify('收支记录已修正！', 'success');
                  }}
                  className="w-full py-2.5 rounded-xl bg-amber-500 text-white font-bold"
                >
                  保存修改
                </button>
              </div>
            )}

            {modalType === 'editDay' && (
              <div className="space-y-3 text-xs">
                <div>
                  <label className="block text-slate-600 font-semibold mb-1">当日课程安排（每行一门课，留空表示全天无课）</label>
                  <textarea
                    rows={3}
                    value={editDayForm.classesText}
                    onChange={(e) => setEditDayForm({ ...editDayForm, classesText: e.target.value })}
                    placeholder="例如：14:00-17:40 多媒体设计2 (教一二区603)"
                    className="w-full p-3 rounded-xl border border-slate-200"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 font-semibold mb-1">当日健身 / 活动计划</label>
                  <input
                    type="text"
                    value={editDayForm.workout}
                    onChange={(e) => setEditDayForm({ ...editDayForm, workout: e.target.value })}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200"
                  />
                </div>
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={editDayForm.isWorkout}
                    onChange={(e) => setEditDayForm({ ...editDayForm, isWorkout: e.target.checked })}
                    className="w-4 h-4 accent-rose-600 rounded"
                  />
                  <span className="font-semibold text-slate-700">标记为重点减脂训练日</span>
                </label>
                <button
                  onClick={() => {
                    const clsArr = editDayForm.classesText
                      .split(/\n+/)
                      .map((s) => s.trim())
                      .filter(Boolean);
                    setState((p) => ({
                      ...p,
                      weekPlan: p.weekPlan.map((d, i) =>
                        i === editDayForm.idx
                          ? { ...d, classes: clsArr, workout: editDayForm.workout.trim() || '自由活动', isWorkout: editDayForm.isWorkout }
                          : d
                      )
                    }));
                    setModalType(null);
                    notify(`已更新 ${editDayForm.day} 的课表与健身计划！`, 'success');
                  }}
                  className="w-full py-2.5 rounded-xl bg-rose-600 text-white font-bold"
                >
                  保存当日安排
                </button>
              </div>
            )}

            {modalType === 'budget' && (
              <div className="space-y-3 text-xs">
                <input
                  type="number"
                  value={budgetInput}
                  onChange={(e) => setBudgetInput(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200"
                />
                <button
                  onClick={() => {
                    const val = parseFloat(budgetInput);
                    if (!val || val <= 0) return;
                    setState((p) => ({ ...p, wallet: { ...p.wallet, budget: val } }));
                    setModalType(null);
                    notify(`本月预算已更新为 ¥${val}`, 'success');
                  }}
                  className="w-full py-2.5 rounded-xl bg-purple-600 text-white font-bold"
                >
                  保存预算
                </button>
              </div>
            )}

            {modalType === 'reward' && (
              <div className="space-y-3 text-xs">
                <input
                  type="text"
                  placeholder="奖励名称（如：买一本新画册）"
                  value={rewardForm.title}
                  onChange={(e) => setRewardForm({ ...rewardForm, title: e.target.value })}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200"
                />
                <input
                  type="number"
                  placeholder="所需金币"
                  value={rewardForm.cost}
                  onChange={(e) => setRewardForm({ ...rewardForm, cost: e.target.value })}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200"
                />
                <button
                  onClick={() => {
                    if (!rewardForm.title.trim()) return;
                    setState((p) => ({
                      ...p,
                      wallet: {
                        ...p.wallet,
                        rewards: [...p.wallet.rewards, { id: Date.now(), title: rewardForm.title.trim(), cost: parseInt(rewardForm.cost, 10) || 120, icon: '🎁', redeemed: 0 }]
                      }
                    }));
                    setRewardForm({ title: '', cost: '120', icon: '🎁' });
                    setModalType(null);
                    notify('已上架新奖励！', 'success');
                  }}
                  className="w-full py-2.5 rounded-xl bg-amber-500 text-white font-bold"
                >
                  上架奖励
                </button>
              </div>
            )}

            {modalType === 'newCat' && (
              <div className="space-y-3 text-xs">
                <input
                  type="text"
                  placeholder="输入新分类名称（如：毕设参考）"
                  value={newCatInput}
                  onChange={(e) => setNewCatInput(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200"
                />
                <button
                  onClick={() => {
                    const name = newCatInput.trim();
                    if (!name || state.bookCategories.includes(name)) return;
                    setState((p) => ({ ...p, bookCategories: [...p.bookCategories, name] }));
                    setBookCat(name);
                    setNewCatInput('');
                    setModalType(null);
                    notify(`已创建分类「${name}」`, 'success');
                  }}
                  className="w-full py-2.5 rounded-xl bg-indigo-600 text-white font-bold"
                >
                  创建分类
                </button>
              </div>
            )}

            {modalType === 'addBook' && (
              <div className="space-y-3 text-xs">
                <input
                  type="text"
                  placeholder="书名"
                  value={newBookForm.title}
                  onChange={(e) => setNewBookForm({ ...newBookForm, title: e.target.value })}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200"
                />
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="text"
                    placeholder="作者"
                    value={newBookForm.author}
                    onChange={(e) => setNewBookForm({ ...newBookForm, author: e.target.value })}
                    className="px-3 py-2 rounded-xl border border-slate-200"
                  />
                  <select
                    value={newBookForm.category}
                    onChange={(e) => setNewBookForm({ ...newBookForm, category: e.target.value })}
                    className="px-3 py-2 rounded-xl border border-slate-200 bg-white"
                  >
                    {state.bookCategories.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
                <textarea
                  rows={4}
                  placeholder="粘贴正文内容，或点击下方导入本地完整电子书..."
                  value={newBookForm.content}
                  onChange={(e) => setNewBookForm({ ...newBookForm, content: e.target.value })}
                  className="w-full p-3 rounded-xl border border-slate-200"
                />
                <label className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold cursor-pointer">
                  <FileText className="w-3.5 h-3.5" />
                  <span>导入本地电子书 (.txt / .md / .epub)</span>
                  <input type="file" accept=".txt,.md,.epub,.html" className="hidden" onChange={handleImportEbookFile} />
                </label>
                <button
                  onClick={() => {
                    if (!newBookForm.title.trim()) return;
                    const paras = newBookForm.content.trim()
                      ? newBookForm.content.split(/\n+/).map((p) => p.trim()).filter(Boolean)
                      : [`《${newBookForm.title}》已加入书架。`];
                    setState((p) => ({
                      ...p,
                      books: [
                        {
                          id: Date.now(),
                          title: newBookForm.title.trim(),
                          author: newBookForm.author.trim() || '私人藏书',
                          category: newBookForm.category,
                          progress: 0,
                          currentPage: 0,
                          readMins: 0,
                          coverBg: 'from-indigo-600 to-purple-800',
                          content: paras
                        },
                        ...p.books
                      ]
                    }));
                    setNewBookForm({ title: '', author: '', category: state.bookCategories[0] || '地大专业', content: '' });
                    setModalType(null);
                    notify('新书已成功入架，支持翻页与目录跳转！', 'success');
                  }}
                  className="w-full py-2.5 rounded-xl bg-indigo-600 text-white font-bold"
                >
                  加入书架
                </button>
              </div>
            )}

            {modalType === 'ddl' && (
              <div className="space-y-3 text-xs">
                <input
                  type="text"
                  placeholder="提醒事项"
                  value={newDDLForm.title}
                  onChange={(e) => setNewDDLForm({ ...newDDLForm, title: e.target.value })}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200"
                />
                <input
                  type="text"
                  placeholder="截止时间"
                  value={newDDLForm.due}
                  onChange={(e) => setNewDDLForm({ ...newDDLForm, due: e.target.value })}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200"
                />
                <button
                  onClick={() => {
                    if (!newDDLForm.title.trim()) return;
                    setState((p) => ({
                      ...p,
                      ddls: [{ id: Date.now(), title: newDDLForm.title.trim(), due: newDDLForm.due, urgent: true }, ...p.ddls]
                    }));
                    setModalType(null);
                    notify('提醒已添加！', 'success');
                  }}
                  className="w-full py-2.5 rounded-xl bg-rose-600 text-white font-bold"
                >
                  添加提醒
                </button>
              </div>
            )}

            {modalType === 'editMeal' && (
              <div className="space-y-3 text-xs">
                <div>
                  <label className="block text-slate-600 font-semibold mb-1">餐次</label>
                  <select
                    value={editMealForm.type}
                    onChange={(e) => setEditMealForm({ ...editMealForm, type: e.target.value })}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-white"
                  >
                    <option value="早午餐 (09:30)">早午餐 (09:30)</option>
                    <option value="午餐 (12:30)">午餐 (12:30)</option>
                    <option value="晚餐 (18:30)">晚餐 (18:30)</option>
                    <option value="夜宵低卡加餐">夜宵低卡加餐</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-600 font-semibold mb-1">餐食描述</label>
                  <input
                    type="text"
                    value={editMealForm.desc}
                    onChange={(e) => setEditMealForm({ ...editMealForm, desc: e.target.value })}
                    placeholder="输入食物内容..."
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200"
                  />
                </div>
                <div className="grid grid-cols-2 gap-2.5">
                  <div>
                    <label className="block text-slate-600 font-semibold mb-1">餐前总热量 (kcal)</label>
                    <input
                      type="number"
                      value={editMealForm.preCal}
                      onChange={(e) => setEditMealForm({ ...editMealForm, preCal: Number(e.target.value) || 0 })}
                      className="w-full px-3 py-2.5 rounded-xl border border-slate-200 font-bold"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-600 font-semibold mb-1">剩饭扣除 (kcal)</label>
                    <input
                      type="number"
                      value={editMealForm.leftoverCal}
                      onChange={(e) => setEditMealForm({ ...editMealForm, leftoverCal: Number(e.target.value) || 0 })}
                      className="w-full px-3 py-2.5 rounded-xl border border-slate-200 font-bold text-emerald-700"
                    />
                  </div>
                </div>
                <div className="p-3 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-between">
                  <span className="text-amber-900 font-semibold">修正后实际净摄入：</span>
                  <span className="text-base font-extrabold text-amber-800">
                    {Math.max(0, Number(editMealForm.preCal) - Number(editMealForm.leftoverCal))} kcal
                  </span>
                </div>
                <button
                  onClick={() => {
                    const pre = Math.max(0, Number(editMealForm.preCal) || 0);
                    const left = Math.max(0, Number(editMealForm.leftoverCal) || 0);
                    const net = Math.max(0, pre - left);
                    setState((prev) => ({
                      ...prev,
                      calories: {
                        ...prev.calories,
                        meals: prev.calories.meals.map((m) =>
                          m.id === editMealForm.id
                            ? { ...m, type: editMealForm.type, desc: editMealForm.desc, preCal: pre, leftoverCal: left, netCal: net }
                            : m
                        )
                      }
                    }));
                    setModalType(null);
                    notify(`热量记录已修正为 ${net} kcal！`, 'success');
                  }}
                  className="w-full py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold"
                >
                  保存修正并重算今日热量
                </button>
              </div>
            )}

            {modalType === 'backup' && (
              <div className="space-y-3 text-xs">
                <p className="text-slate-500">所有记录自动保存在浏览器本地存储中，也可导出 JSON 文件跨设备恢复。</p>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => {
                      const blob = new Blob([JSON.stringify(state, null, 2)], { type: 'application/json' });
                      const url = URL.createObjectURL(blob);
                      const a = document.createElement('a');
                      a.href = url;
                      a.download = `GapYearOS_React备份_${new Date().toISOString().slice(0, 10)}.json`;
                      a.click();
                      URL.revokeObjectURL(url);
                      notify('备份已导出！', 'success');
                    }}
                    className="py-2.5 px-3 rounded-xl bg-emerald-600 text-white font-bold flex items-center justify-center gap-1"
                  >
                    <Download className="w-3.5 h-3.5" />导出备份
                  </button>
                  <label className="py-2.5 px-3 rounded-xl bg-slate-100 text-slate-800 font-bold flex items-center justify-center gap-1 cursor-pointer">
                    <Upload className="w-3.5 h-3.5" />恢复备份
                    <input
                      type="file"
                      accept=".json"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (!file) return;
                        const reader = new FileReader();
                        reader.onload = (ev) => {
                          try {
                            setState({ ...DEFAULT_STATE, ...JSON.parse(ev.target.result) });
                            setModalType(null);
                            notify('数据已恢复！', 'success');
                          } catch {}
                        };
                        reader.readAsText(file);
                      }}
                    />
                  </label>
                </div>
                <button
                  onClick={() => {
                    localStorage.removeItem(STORAGE_KEY);
                    setState(DEFAULT_STATE);
                    setModalType(null);
                    notify('已清空全部历史记录，恢复为纯净初始状态！', 'info');
                  }}
                  className="w-full py-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold border border-rose-200 transition"
                >
                  一键重置并清空所有数据
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {activeBook && (() => {
        const bookPages = buildBookPages(activeBook.content);
        const totalPages = bookPages.length;
        const safePageIdx = Math.max(0, Math.min(totalPages - 1, readerPage));
        const tocList = extractBookToc(bookPages);

        return (
          <div className={`fixed inset-0 z-50 bg-slate-900/85 backdrop-blur-sm flex items-center justify-center ${isReaderFullscreen ? 'p-0' : 'p-2 sm:p-5'}`}>
            <div
              className={`flex flex-col shadow-2xl overflow-hidden relative transition-all duration-200 ${
                isReaderFullscreen ? 'w-screen h-screen rounded-none' : 'rounded-3xl max-w-4xl w-full h-[92vh]'
              } ${
                readerTheme === 'paper'
                  ? 'bg-[#faf6ed] text-[#2c2825]'
                  : readerTheme === 'mint'
                  ? 'bg-[#e8f3ec] text-[#1f3328]'
                  : 'bg-[#181a1f] text-slate-200'
              }`}
            >
              {!hideReaderChrome && (
                <div className="px-4 pt-[max(12px,env(safe-area-inset-top))] pb-3 border-b border-black/10 flex flex-wrap items-center justify-between gap-2 shrink-0">
                  <div className="flex items-center gap-2">
                    <button onClick={handleCloseReader} className="px-3 py-1.5 rounded-xl bg-black/5 hover:bg-black/10 text-xs font-bold flex items-center gap-1 transition">
                      <ArrowLeft className="w-3.5 h-3.5" />保存退出
                    </button>
                    <button
                      onClick={() => setShowTocDrawer((v) => !v)}
                      className="px-3 py-1.5 rounded-xl bg-indigo-600/15 text-indigo-800 text-xs font-bold flex items-center gap-1 hover:bg-indigo-600/25 transition"
                    >
                      <BookOpen className="w-3.5 h-3.5" />目录 ({tocList.length})
                    </button>
                    <h3 className="font-bold text-sm truncate max-w-[120px] sm:max-w-xs">{activeBook.title}</h3>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => {
                        setIsReaderFullscreen((f) => !f);
                        setHideReaderChrome(false);
                      }}
                      className="px-2.5 py-1 rounded-xl bg-indigo-600 text-white text-[11px] font-bold flex items-center gap-1 shadow-sm"
                    >
                      {isReaderFullscreen ? <Minimize2 className="w-3 h-3" /> : <Maximize2 className="w-3 h-3" />}
                      <span>{isReaderFullscreen ? '窗口模式' : '全屏模式'}</span>
                    </button>
                    <button
                      onClick={() => setReaderMode((m) => (m === 'page' ? 'scroll' : 'page'))}
                      className="px-2.5 py-1 rounded-xl bg-black/5 text-[11px] font-bold"
                    >
                      {readerMode === 'page' ? '📖 翻页' : '📜 滚动'}
                    </button>
                    <div className="px-2.5 py-1 rounded-xl bg-emerald-600/15 text-emerald-800 text-xs font-bold flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      <span>
                        {String(Math.floor(readerSecs / 60)).padStart(2, '0')}:{String(readerSecs % 60).padStart(2, '0')}
                      </span>
                    </div>
                    <button onClick={() => setReaderTheme('paper')} className="w-6 h-6 rounded-lg bg-[#faf6ed] border border-slate-300" />
                    <button onClick={() => setReaderTheme('mint')} className="w-6 h-6 rounded-lg bg-[#e8f3ec] border border-slate-300" />
                    <button onClick={() => setReaderTheme('dark')} className="w-6 h-6 rounded-lg bg-[#181a1f] border border-slate-600" />
                    <button onClick={() => setReaderFontSize((s) => Math.max(13, s - 1))} className="w-6 h-6 rounded-lg bg-black/5 text-xs font-bold">
                      A-
                    </button>
                    <button onClick={() => setReaderFontSize((s) => Math.min(24, s + 1))} className="w-6 h-6 rounded-lg bg-black/5 text-xs font-bold">
                      A+
                    </button>
                  </div>
                </div>
              )}

              {showTocDrawer && (
                <div className="absolute top-14 left-3 bottom-16 w-64 sm:w-72 bg-white/95 backdrop-blur-md text-slate-800 rounded-2xl shadow-2xl border border-slate-200 z-20 flex flex-col overflow-hidden">
                  <div className="p-3 border-b border-slate-100 flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-900">章节目录 · 点击跳转</span>
                    <button onClick={() => setShowTocDrawer(false)} className="text-slate-400 hover:text-slate-600">
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="flex-1 overflow-y-auto p-2 space-y-1">
                    {tocList.map((item, idx) => (
                      <button
                        key={idx}
                        onClick={() => {
                          updateBookPageProgress(activeBook.id, item.page, totalPages);
                          setReaderMode('page');
                          setShowTocDrawer(false);
                          notify(`已跳转至：${item.title}`, 'info');
                        }}
                        className={`w-full text-left px-3 py-2 rounded-xl text-xs transition flex items-center justify-between gap-2 ${
                          safePageIdx >= item.page ? 'bg-indigo-50 text-indigo-800 font-bold' : 'hover:bg-slate-100 text-slate-700'
                        }`}
                      >
                        <span className="truncate">{item.title}</span>
                        <span className="text-[10px] text-slate-400 shrink-0">第{item.page + 1}页</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div
                ref={readerScrollRef}
                onTouchStart={(e) => {
                  touchStartXRef.current = e.touches[0].clientX;
                }}
                onTouchEnd={(e) => {
                  if (touchStartXRef.current === null || readerMode !== 'page') return;
                  const deltaX = e.changedTouches[0].clientX - touchStartXRef.current;
                  touchStartXRef.current = null;
                  if (Math.abs(deltaX) > 45) {
                    if (deltaX < 0) updateBookPageProgress(activeBook.id, safePageIdx + 1, totalPages);
                    else updateBookPageProgress(activeBook.id, safePageIdx - 1, totalPages);
                  }
                }}
                onClick={(e) => {
                  if (e.target.closest('button') || e.target.closest('input')) return;
                  if (readerMode === 'page') {
                    const rect = e.currentTarget.getBoundingClientRect();
                    const ratio = (e.clientX - rect.left) / rect.width;
                    if (ratio < 0.28) {
                      updateBookPageProgress(activeBook.id, safePageIdx - 1, totalPages);
                      return;
                    }
                    if (ratio > 0.72) {
                      updateBookPageProgress(activeBook.id, safePageIdx + 1, totalPages);
                      return;
                    }
                  }
                  if (isReaderFullscreen) setHideReaderChrome((h) => !h);
                }}
                className={`flex-1 ${readerMode === 'page' ? 'overflow-hidden' : 'overflow-y-auto'} px-5 sm:px-14 pt-[max(20px,env(safe-area-inset-top))] pb-4 sm:py-8 leading-loose relative select-none flex flex-col justify-between`}
                style={{ fontSize: `${readerFontSize}px` }}
              >
                <div className="max-w-3xl w-full mx-auto flex-1 flex flex-col justify-between">
                  {readerMode === 'page' ? (
                    <>
                      <div className="space-y-3 text-justify overflow-hidden">
                        {bookPages[safePageIdx].map((p, i) => (
                          <p key={i} className="indent-8">{p}</p>
                        ))}
                      </div>

                      <div className="pt-3 mt-2 border-t border-black/10 flex items-center justify-between gap-2 text-xs shrink-0">
                        <button
                          disabled={safePageIdx <= 0}
                          onClick={() => updateBookPageProgress(activeBook.id, safePageIdx - 1, totalPages)}
                          className="px-3 py-2 rounded-xl bg-black/10 hover:bg-black/15 disabled:opacity-30 font-bold transition whitespace-nowrap shrink-0"
                        >
                          ← 上一页
                        </button>
                        <div className="flex-1 min-w-0 max-w-xs flex items-center gap-1.5">
                          <input
                            type="range"
                            min={0}
                            max={Math.max(0, totalPages - 1)}
                            value={safePageIdx}
                            onChange={(e) => updateBookPageProgress(activeBook.id, Number(e.target.value), totalPages)}
                            className="flex-1 min-w-0 accent-indigo-600"
                          />
                          <span className="font-bold whitespace-nowrap text-[11px] shrink-0">
                            {safePageIdx + 1}/{totalPages}
                          </span>
                        </div>
                        <button
                          disabled={safePageIdx >= totalPages - 1}
                          onClick={() => updateBookPageProgress(activeBook.id, safePageIdx + 1, totalPages)}
                          className="px-3 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-30 text-white font-bold transition whitespace-nowrap shrink-0"
                        >
                          下一页 →
                        </button>
                      </div>
                    </>
                  ) : (
                    <div className="space-y-5 text-justify">
                      {activeBook.content.map((p, i) => (
                        <p key={i} className="indent-8">{p}</p>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {!hideReaderChrome && (
                <div className="px-4 py-3 border-t border-black/10 flex flex-wrap items-center justify-between gap-2 text-xs shrink-0">
                  <div className="flex items-center gap-2">
                    <span>
                      已自动保存进度：<strong>{activeBook.progress}%</strong>
                    </span>
                    <button
                      onClick={() => {
                        updateBookPageProgress(activeBook.id, Math.min(totalPages - 1, safePageIdx + 1), totalPages);
                        grantReward(25, 25, '阅读进度已保存，获得 +25 金币与 1 颗矿石！', 1);
                      }}
                      className="px-3 py-1.5 rounded-xl bg-indigo-600 text-white font-bold"
                    >
                      完成本节打卡 (+25金币)
                    </button>
                  </div>
                  <div className="flex items-center gap-2 flex-1 max-w-sm">
                    <input
                      type="text"
                      value={readerNote}
                      onChange={(e) => setReaderNote(e.target.value)}
                      placeholder="记一句批注..."
                      className="flex-1 px-3 py-1.5 rounded-xl bg-white/80 border border-black/15 text-slate-800"
                    />
                    <button
                      onClick={() => {
                        if (!readerNote.trim()) return;
                        setReaderNote('');
                        notify('读书批注已保存！', 'success');
                      }}
                      className="px-3 py-1.5 rounded-xl bg-amber-600 text-white font-bold"
                    >
                      存笔记
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        );
      })()}
    </div>
  );
}