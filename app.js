
// Family App - CDN Version
const { createElement: h, useState, useEffect, useMemo } = React;
const { initializeApp, getApps, getApp } = firebase;
const { getAuth, signInAnonymously, signInWithCustomToken, onAuthStateChanged } = firebase.auth;
const { getFirestore, collection, doc, setDoc, getDoc, onSnapshot, addDoc, updateDoc, deleteDoc, writeBatch } = firebase.firestore;




  getAuth,

  signInAnonymously,

  signInWithCustomToken,

  onAuthStateChanged

} from 'firebase/auth';


  getFirestore,

  collection,

  doc,

  setDoc,

  getDoc,

  onSnapshot,

  addDoc,

  updateDoc,

  deleteDoc,

  writeBatch

} from 'firebase/firestore';


  Utensils,

  ShoppingCart,

  Plus,

  CheckCircle2,

  Circle,

  Trash2,

  RefreshCw,

  ChevronLeft,

  ChevronRight,

  Sparkles,

  X,

  Check,

  Home,

  Fingerprint,

  ShieldCheck,

  FileUp,

  PlusCircle,

  KeyRound,

  Zap,

  FolderPlus,

  ChevronRight as ChevronRightIcon,

  Tag,

  LayoutGrid,

  Info,

  StickyNote,

  Send

} from 'lucide-react';



const XLSX_SCRIPT_URL = "https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18=

.5/xlsx.full.min.js";

const APP_VERSION = "v1.5.6";



const getFirebaseConfig = () => {

  try {

    return typeof __firebase_config !== 'undefined' ? JSON.parse(__fire=

base_config) : null;

  } catch (e) { return null; }

};



const MEAL_TYPES = ['Breakfast', 'Lunch', 'Snack', 'Dinner'];

const SUGGESTED_MEALS = {

  Breakfast: ['Avocado Toast', 'Pancakes', 'Scrambled Eggs'],

  Lunch: ['Chicken Caesar Salad', 'Tomato Soup', 'Turkey Club'],

  Snack: ['Fruit Bowl', 'Yogurt', 'Nuts', 'Hummus & Carrots'],

  Dinner: ['Spaghetti Carbonara', 'Grilled Salmon', 'Thai Green Curry']

};




  const [isConfigReady, setIsConfigReady] = useState(false);

  const [user, setUser] = useState(null);

  const [loginError, setLoginError] = useState(null);

  const [appId] = useState(() => typeof __app_id !== 'undefined' ? =

__app_id : 'default-app-id');

  const [isXlsxLoaded, setIsXlsxLoaded] = useState(false);



  const [activeProfile, setActiveProfile] = useState(() => {

    const saved = localStorage.getItem('family_app_profile');

    try { return saved ? JSON.parse(saved) : null; } catch { return null; }

  });

  const [inputPhone, setInputPhone] = useState(() => localStorage.getIt=

em('family_app_phone') || '');

  const [inputProfileName, setInputProfileName] = useState(() => {

    const saved = localStorage.getItem('family_app_profile');

    try { return saved ? JSON.parse(saved).name : ''; } catch { return ''; =

}

  });

  const [quickCode, setQuickCode] = useState('');

  const [isQuickLoginMode, setIsQuickLoginMode] = useState(true);



  const [activeTab, setActiveTab] = useState('meals');

  const [meals, setMeals] = useState([]);

  const [groceries, setGroceries] = useState([]);

  const [dishes, setDishes] = useState([]);

  const [categories, setCategories] = useState([]);

  const [selectedDate, setSelectedDate] = useState(new Date().toISOString=

().split('T')[0]);



  const [isLibraryOpen, setIsLibraryOpen] = useState(false);

  const [currentCategoryId, setCurrentCategoryId] = useState(null);

  const [newCategoryName, setNewCategoryName] = useState('');

  const [newDishName, setNewDishName] = useState('');

  const [selectingFor, setSelectingFor] = useState(null);

  const [isImporting, setIsImporting] = useState(false);



  const [editingRemark, setEditingRemark] = useState(null);

  const [manualInputs, setManualInputs] = useState({});

  const [newPin, setNewPin] = useState('');

  const [newGrocery, setNewGrocery] = useState('');



  const firebaseRefs = useMemo(() => {

    const config = getFirebaseConfig();

    if (!config) return null;

    const app = getApps().length > 0 ? getApp() : initializeApp(config);

    return { auth: getAuth(app), db: getFirestore(app) };

  }, []);



  useEffect(() => {

    if (window.XLSX) { setIsXlsxLoaded(true); return; }

    const script = document.createElement("script");

    script.src = XLSX_SCRIPT_URL; script.async = true;

    script.onload = () => setIsXlsxLoaded(true);

    document.head.appendChild(script);

  }, []);



  useEffect(() => {

    if (!firebaseRefs) return;

    const { auth } = firebaseRefs;

    const initAuth = async () => {

      if (typeof __initial_auth_token !== 'undefined' && __initial_auth=

_token) {

        await signInWithCustomToken(auth, __initial_auth_token).catch(() =

=> signInAnonymously(auth));

      } else {

        await signInAnonymously(auth);

      }

    };

    initAuth();

    return onAuthStateChanged(auth, (u) => {

      setUser(u);

      setIsConfigReady(true);

    });

  }, [firebaseRefs]);



  useEffect(() => {

    if (!user || !activeProfile || !firebaseRefs) return;

    const { db } = firebaseRefs;

    const root = ['artifacts', appId, 'public', 'data', 'hubs', activePro=

file.hubKey];



    const subs = [

      onSnapshot(collection(db, ...root, 'meals'), (s) => setMeals(s.docs=

.map(d => ({ id: d.id, ...d.data() })))),

      onSnapshot(collection(db, ...root, 'groceries'), (s) => setGrocerie=

s(s.docs.map(d => ({ id: d.id, ...d.data() })))),

      onSnapshot(collection(db, ...root, 'dishes'), (s) => setDishes(s.do=

cs.map(d => ({ id: d.id, ...d.data() })))),

      onSnapshot(collection(db, ...root, 'categories'), (s) => setCategor=

ies(s.docs.map(d => ({ id: d.id, ...d.data() }))))

    ];

    return () => subs.forEach(unsub => unsub());

  }, [user, activeProfile, firebaseRefs, appId]);



  const getHubRef = (col, docId = null) => {

    if (!activeProfile || !firebaseRefs) return null;

    const c = collection(firebaseRefs.db, 'artifacts', appId, 'public', '=

data', 'hubs', activeProfile.hubKey, col);

    return docId ? doc(c, docId) : c;

  };



  const handleQuickLogin = async () => {

    if (quickCode.length < 4) return;

    try {

      const snap = await getDoc(doc(firebaseRefs.db, 'artifacts', appId, =

'public', 'data', 'pins', quickCode));

      if (snap.exists()) {

        const d = snap.data();

        const p = { hubKey: d.hubKey, name: d.name, phone: d.phone };

        localStorage.setItem('family_app_profile', JSON.stringify(p));

        setActiveProfile(p);

      } else { setLoginError("Invalid PIN"); }

    } catch (e) { setLoginError("Login Error"); }

  };



  const handleFullLogin = () => {

    const p = inputPhone.replace(/\D/g, '');

    const n = inputProfileName.trim();

    if (p.length < 5 || !n) return;

    const prof = { hubKey: `${p}_${n.toLowerCase()}`, name: n, phone: p }=

;

    localStorage.setItem('family_app_profile', JSON.stringify(prof));

    setActiveProfile(prof);

  };



  const updateDayNote = async (val) => {

    const id = `${selectedDate}_planner`;

    await setDoc(getHubRef('meals', id), {

      date: selectedDate, type: 'PLANNER_NOTE', note: val, lastUpdated: Dat=

e.now()

    }, { merge: true });

  };



  const addDishToMeal = async (type, name) => {

    if (!name || !name.trim()) return;

    const id = `${selectedDate}_${type}`;

    const m = (meals || []).find(x => x.id === id);

    const existing = Array.isArray(m?.dishes) ? m.dishes : [];

    if (existing.includes(name)) return;

    await setDoc(getHubRef('meals', id), {

      date: selectedDate, type, dishes: [...existing, name], lastUpdated: D=

ate.now()

    }, { merge: true });

    setManualInputs(prev => ({ ...prev, [type]: '' }));

    setIsLibraryOpen(false);

  };



  const removeDish = async (type, idx) => {

    const id = `${selectedDate}_${type}`;

    const m = (meals || []).find(x => x.id === id);

    if (!m) return;

    const updated = [...m.dishes];

    updated.splice(idx, 1);

    await updateDoc(getHubRef('meals', id), { dishes: updated, lastUpdated:=

 Date.now() });

  };



  const saveMealNote = async (type) => {

    if (!editingRemark) return;

    const id = `${selectedDate}_${type}`;

    await setDoc(getHubRef('meals', id), { remark: editingRemark.value, las=

tUpdated: Date.now() }, { merge: true });

    setEditingRemark(null);

  };



  const handleAddGrocery = async () => {

    const val = newGrocery.trim();

    if (!val) return;

    await addDoc(getHubRef('groceries'), { text: val, completed: false, cre=

atedAt: Date.now() });

    setNewGrocery('');

  };



  const handleCreateCategory = async () => {

    const val = newCategoryName.trim();

    if (!val) return;

    await addDoc(getHubRef('categories'), { name: val, createdAt: Date.now(=

) });

    setNewCategoryName('');

  };



  const handleAddDishToLib = async () => {

    const val = newDishName.trim();

    if (!val || !currentCategoryId) return;

    await addDoc(getHubRef('dishes'), { name: val, categoryId: currentCateg=

oryId, createdAt: Date.now() });

    setNewDishName('');

  };



  const handleExcelUpload = (e) => {

    const file = e.target.files[0];

    if (!file || !currentCategoryId || !window.XLSX) return;

    setIsImporting(true);

    const reader = new FileReader();

    reader.onload = async (evt) => {

      try {

        const bstr = evt.target.result;

        const wb = window.XLSX.read(bstr, { type: 'binary' });

        const ws = wb.Sheets[wb.SheetNames[0]];

        const data = window.XLSX.utils.sheet_to_json(ws);

        const batch = writeBatch(firebaseRefs.db);

        data.forEach(row => {

          const val = Object.values(row)[0];

          if (val) {

            const dRef = doc(getHubRef('dishes'));

            batch.set(dRef, { name: String(val).trim(), categoryId: current=

CategoryId, createdAt: Date.now() });

          }

        });

        await batch.commit();

      } finally { setIsImporting(false); e.target.value = ''; }

    };

    reader.readAsBinaryString(file);

  };



  if (!isConfigReady) return <div className="h-screen flex items-center j=

ustify-center bg-slate-50"><RefreshCw className="animate-spin text-indigo=

-600" /></div>;



  if (!activeProfile) {

    return (

      <div className="min-h-screen bg-slate-50 flex items-center justify-=

center p-6">

        <div className="max-w-md w-full bg-white rounded-[2.5rem] shadow-=

2xl p-8 border border-slate-100">

          <div className="flex justify-center mb-6"><div className="p-4=

 bg-indigo-50 rounded-2xl text-indigo-600">{isQuickLoginMode ? <KeyRound si=

ze={40}/> : <ShieldCheck size={40}/>}</div></div>

          <h2 className="text-2xl font-black text-center mb-8 text-slate-=

900 uppercase tracking-widest leading-tight">Family Planner</h2>

          <div className="space-y-4">

            {isQuickLoginMode ? (

              <div className="space-y-4">

                <input type="password" inputMode="numeric" placeholder=

="=95=95=95=95" className="w-full px-5 py-5 rounded-2xl bg-slate-50 bor=

der border-slate-100 outline-none text-center text-3xl font-black tracking-=

[0.5em]" maxLength={6} value={quickCode} onChange={(e) => setQuickC=

ode(e.target.value)} />

                <button onClick={handleQuickLogin} className="w-full bg=

-indigo-600 text-white font-black py-5 rounded-2xl shadow-xl hover:bg-indig=

o-700 active:scale-95 transition-all">ENTER HUB</button>

              </div>

            ) : (

              <div className="space-y-4">

                <input type="tel" placeholder="Phone Number" className=

="w-full px-6 py-4 rounded-2xl bg-slate-50 border border-slate-100 font-b=

old" value={inputPhone} onChange={(e) => setInputPhone(e.target.value=

)} />

                <input type="text" placeholder="Family Name" className=

="w-full px-6 py-4 rounded-2xl bg-slate-50 border border-slate-100 font-b=

old" value={inputProfileName} onChange={(e) => setInputProfileName(e.=

target.value)} />

                <button onClick={handleFullLogin} className="w-full bg-=

indigo-600 text-white font-black py-5 rounded-2xl shadow-xl hover:bg-indigo=

-700 active:scale-95 transition-all">LOGIN</button>

              </div>

            )}

            {loginError && <p className="text-[10px] text-rose-500 font-b=

lack text-center uppercase">{loginError}</p>}

            <button onClick={() => setIsQuickLoginMode(!isQuickLoginMod=

e)} className="w-full text-slate-400 font-black text-[10px] uppercase mt-=

4">Change Login Method</button>

          </div>

        </div>

      </div>

    );

  }



  const dailyNote = (meals || []).find(m => m.id === `${selectedD=

ate}_planner`)?.note || '';



  return (

    <div className="min-h-screen bg-slate-50 pb-32 font-sans select-none =

overflow-x-hidden">

      <header className="bg-white/80 backdrop-blur-md border-b sticky top=

-0 z-30 px-5 py-4">

        <div className="flex items-center justify-between mb-4">

          <div className="flex items-center gap-2">

            <div className="bg-indigo-600 p-2 rounded-xl text-white shado=

w-md"><Home size={18}/></div>

            <div>

              <h1 className="text-sm font-black text-slate-900 uppercase =

leading-none">{activeProfile.name} Hub</h1>

              <p className="text-[9px] font-bold text-slate-400 mt-1 uppe=

rcase tracking-widest">{APP_VERSION}</p>

            </div>

          </div>

          <button onClick={() => { setIsLibraryOpen(true); setCurrentCa=

tegoryId(null); }} className="bg-slate-900 text-white px-4 py-2 rounded-f=

ull text-[10px] font-black flex items-center gap-1.5 shadow-md">

            <LayoutGrid size={12}/> LIBRARY

          </button>

        </div>

        <div className="flex items-center justify-between gap-2 bg-slate-=

100/50 p-1.5 rounded-2xl border border-slate-100">

          <button onClick={() => { const d = new Date(selectedDate); =

d.setDate(d.getDate() - 1); setSelectedDate(d.toISOString().split('T')[0]);=

 }} className="p-2 bg-white rounded-xl shadow-sm"><ChevronLeft size={16=

}/></button>

          <p className="font-black text-slate-700 text-xs">{new Date(sele=

ctedDate).toLocaleDateString('en-US', { weekday: 'long', month: 'short', da=

y: 'numeric' })}</p>

          <button onClick={() => { const d = new Date(selectedDate); =

d.setDate(d.getDate() + 1); setSelectedDate(d.toISOString().split('T')[0]);=

 }} className="p-2 bg-white rounded-xl shadow-sm"><ChevronRight size={1=

6}/></button>

        </div>

      </header>



      <main className="max-w-lg mx-auto p-4 space-y-6">

        {activeTab === 'meals' && (

          <div className="space-y-6">

            <div className="bg-amber-50 rounded-[2rem] p-6 border border-=

amber-100 shadow-sm relative overflow-hidden">

               <div className="absolute top-0 right-0 p-4 opacity-10"><St=

ickyNote size={60}/></div>

               <div className="flex items-center gap-2 mb-3">

                 <span className="text-[10px] font-black text-amber-600 u=

ppercase tracking-widest">Daily Planner Note</span>

               </div>

               <textarea

                 className="w-full bg-transparent border-none outline-non=

e font-bold text-sm text-amber-900 placeholder:text-amber-200 resize-none m=

in-h-[60px]"

                 placeholder="Agenda for today..."

                 value={dailyNote}

                 onChange={(e) => updateDayNote(e.target.value)}

               />

            </div>



            <div className="space-y-4">

              {MEAL_TYPES.map(type => {

                const m = (meals || []).find(x => x.id === `${sel=

ectedDate}_${type}`);

                const isEdit = editingRemark?.type === type;

                const dishList = Array.isArray(m?.dishes) ? m.dishes : []=

;

                return (

                  <div key={type} className="bg-white rounded-[2rem] p-=

6 shadow-sm border border-slate-100 relative overflow-hidden">

                    <div className="absolute left-0 top-0 bottom-0 w-1 bg=

-indigo-500" />

                    <div className="flex justify-between items-center mb-=

4">

                      <span className="text-[10px] font-black text-slate-=

400 uppercase tracking-widest">{type}</span>

                      <div className="flex gap-2">

                        <button onClick={() => { setSelectingFor({ type=

 }); setIsLibraryOpen(true); setCurrentCategoryId(null); }} className="p-=

2 bg-indigo-50 text-indigo-600 rounded-xl"><PlusCircle size={16}/></butto=

n>

                        <button onClick={() => addDishToMeal(type, SUGG=

ESTED_MEALS[type][Math.floor(Math.random() * SUGGESTED_MEALS[type].length)]=

)} className="p-2 bg-purple-50 text-purple-600 rounded-xl"><Sparkles size=

={16}/></button>

                      </div>

                    </div>



                    <div className="mb-4">

                       <div className="flex gap-2 mb-3">

                         <input

                           type="text"

                           placeholder={`Add ${type} dish...`}

                           className="flex-1 bg-slate-50 border-none px-4=

 py-2 rounded-xl text-sm font-bold text-slate-700 outline-none focus:bg-ind=

igo-50 transition-colors"

                           value={manualInputs[type] || ''}

                           onChange={(e) => setManualInputs(prev => (=

{ ...prev, [type]: e.target.value }))}

                           onKeyDown={(e) => e.key === 'Enter' &&=

 addDishToMeal(type, manualInputs[type])}

                         />

                         <button onClick={() => addDishToMeal(type, man=

ualInputs[type])} className="p-2 bg-slate-100 text-slate-600 rounded-xl">=

<Send size={16}/></button>

                       </div>



                       <div className="space-y-2">

                        {dishList.map((dish, i) => (

                          <div key={i} className="flex items-center jus=

tify-between bg-slate-50 px-4 py-3 rounded-xl border border-slate-100">

                            <span className="text-sm font-bold text-slate=

-800 break-words flex-1 pr-2">{dish}</span>

                            <button onClick={() => removeDish(type, i)}=

 className="text-slate-300 flex-shrink-0"><X size={14}/></button>

                          </div>

                        ))}

                      </div>

                    </div>



                    <div className="bg-slate-50/50 rounded-xl p-3 border =

border-slate-50 overflow-hidden">

                      <div className="flex items-center justify-between m=

b-1">

                        <span className="text-[8px] font-black uppercase =

text-slate-400">Cooking Details</span>

                        <button onClick={() => setEditingRemark(isEdit =

? null : { type, value: m?.remark || '' })} className="text-[8px] font-bl=

ack uppercase text-indigo-600 underline">Edit</button>

                      </div>

                      {isEdit ? (

                        <div className="space-y-2">

                          <textarea className="w-full bg-white border bor=

der-slate-200 rounded-lg p-2 text-sm font-bold" rows={4} value={editing=

Remark.value} onChange={(e) => setEditingRemark({ ...editingRemark, val=

ue: e.target.value })} />

                          <button onClick={() => saveMealNote(type)} cl=

assName="w-full py-2 bg-indigo-600 text-white rounded-lg text-[10px] font=

-black uppercase shadow-lg">Save & Format</button>

                        </div>

                      ) : (

                        <div className="text-sm font-bold text-slate-600 =

leading-relaxed whitespace-pre-wrap break-words w-full">

                          {m?.remark || 'No details added...'}

                        </div>

                      )}

                    </div>

                  </div>

                );

              })}

            </div>

          </div>

        )}



        {activeTab === 'groceries' && (

          <div className="space-y-4">

            <div className="flex gap-2">

              <input type="text" placeholder="Grocery item..." classNam=

e="flex-1 px-5 py-4 rounded-2xl bg-white border border-slate-200 outline-=

none font-bold text-sm shadow-sm" value={newGrocery} onChange={(e) =>=

 setNewGrocery(e.target.value)} onKeyDown={(e) => e.key === 'Ente=

r' && handleAddGrocery()} />

              <button onClick={handleAddGrocery} className="bg-indigo-6=

00 text-white px-5 rounded-2xl shadow-lg"><Plus size={24}/></button>

            </div>

            <div className="space-y-2">

              {(groceries || []).sort((a,b) => (b.createdAt || 0) - (a.cr=

eatedAt || 0)).map(item => (

                <div key={item.id} className="bg-white p-5 rounded-2xl =

flex items-center gap-3 shadow-sm border border-slate-50 transition-all act=

ive:scale-[0.98]">

                  <button onClick={() => updateDoc(getHubRef('groceries=

', item.id), { completed: !item.completed })} className="flex-shrink-0">{=

item.completed ? <CheckCircle2 className="text-emerald-500" size={24}/>=

 : <Circle className="text-slate-200" size={24}/>}</button>

                  <span className={`flex-1 text-sm font-bold break-words =

${item.completed ? 'line-through text-slate-300' : 'text-slate-700'}`}>{ite=

m.text}</span>

                  <button onClick={() => deleteDoc(getHubRef('groceries=

', item.id))} className="text-slate-200 hover:text-rose-500 transition-co=

lors flex-shrink-0"><Trash2 size={16}/></button>

                </div>

              ))}

            </div>

          </div>

        )}



        {activeTab === 'settings' && (

          <div className="bg-white rounded-[2rem] p-8 shadow-sm border bo=

rder-slate-100 space-y-8">

            <section>

              <h3 className="text-[10px] font-black text-indigo-600 upper=

case mb-4 tracking-widest flex items-center gap-2"><Info size={14}/> App =

Info</h3>

              <div className="bg-slate-50 p-4 rounded-2xl border border-s=

late-100">

                <p className="text-[9px] font-black text-slate-400 upperc=

ase mb-1">Hub Identifier</p>

                <p className="font-mono text-xs font-black text-slate-700=

 break-all bg-white p-3 rounded-lg border border-slate-100 shadow-inner sel=

ect-all">{appId}</p>

              </div>

            </section>

            <section>

              <h3 className="text-[10px] font-black text-indigo-600 upper=

case mb-4 tracking-widest flex items-center gap-2"><Zap size={14}/> Acces=

s Control</h3>

              <div className="flex gap-2">

                <input type="password" placeholder="Hub PIN" maxLength=

={6} className="flex-1 bg-slate-50 px-4 py-3 rounded-xl font-black text=

-center tracking-widest border border-slate-100" value={newPin} onChange=

={(e) => setNewPin(e.target.value.replace(/\D/g,''))} />

                <button onClick={async () => { if(newPin.length >= 4)=

 { await setDoc(doc(firebaseRefs.db, 'artifacts', appId, 'public', 'data', =

'pins', newPin), { hubKey: activeProfile.hubKey, name: activeProfile.name, =

phone: activeProfile.phone, createdAt: Date.now() }); setNewPin(''); } }} c=

lassName="bg-indigo-600 text-white px-5 rounded-xl text-[10px] font-black=

 uppercase tracking-widest">Set</button>

              </div>

            </section>

            <section className="pt-4">

              <button onClick={() => { setActiveProfile(null); }} class=

Name="w-full py-4 text-slate-400 font-black text-[10px] uppercase trackin=

g-widest bg-slate-100 rounded-xl hover:bg-slate-200 transition-colors">Log =

Out Profile</button>

            </section>

          </div>

        )}

      </main>



      {isLibraryOpen && (

        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-=

50 flex items-end sm:items-center justify-center p-3">

          <div className="bg-white w-full max-w-md rounded-[2.5rem] shado=

w-2xl max-h-[85vh] flex flex-col overflow-hidden">

            <div className="p-6 border-b flex justify-between items-cente=

r bg-white sticky top-0 z-10">

              <div className="flex items-center gap-2">

                {currentCategoryId && <button onClick={() => setCurrent=

CategoryId(null)} className="p-2 bg-slate-100 rounded-xl"><ChevronLeft si=

ze={18}/></button>}

                <h2 className="text-sm font-black text-slate-900 uppercas=

e tracking-tight">{currentCategoryId ? (categories || []).find(c => c.id =

=== currentCategoryId)?.name : "Categories"}</h2>

              </div>

              <button onClick={() => setIsLibraryOpen(false)} className=

="p-2 text-slate-300 bg-slate-50 rounded-xl"><X size={18}/></button>

            </div>



            <div className="p-6 overflow-y-auto flex-1 space-y-4">

              {!currentCategoryId ? (

                <div className="space-y-4">

                  <div className="flex gap-2">

                    <input type="text" placeholder="Add Category..." cl=

assName="flex-1 px-4 py-3 bg-slate-50 rounded-xl font-bold text-sm outlin=

e-none border border-transparent focus:border-indigo-100" value={newCateg=

oryName} onChange={(e) => setNewCategoryName(e.target.value)} onKeyDown=

={(e) => e.key === 'Enter' && handleCreateCategory()}/>

                    <button onClick={handleCreateCategory} className="b=

g-indigo-600 text-white px-4 rounded-xl shadow-md"><FolderPlus size={18}/=

></button>

                  </div>

                  <div className="space-y-2">

                    {(categories || []).map(cat => (

                      <button key={cat.id} onClick={() => setCurrentC=

ategoryId(cat.id)} className="w-full flex items-center justify-between p-=

4 bg-slate-50 rounded-2xl border border-slate-100 group transition-all">

                        <div className="flex items-center gap-3">

                          <Tag size={16} className="text-indigo-500"/>

                          <span className="font-bold text-slate-700 upper=

case text-xs text-left">{cat.name}</span>

                        </div>

                        <div className="flex items-center gap-2">

                          <span className="text-[9px] font-black text-sla=

te-300 uppercase whitespace-nowrap">{(dishes || []).filter(d => d.categor=

yId === cat.id).length} Dishes</span>

                          <ChevronRightIcon size={14} className="text-s=

late-300"/>

                        </div>

                      </button>

                    ))}

                  </div>

                </div>

              ) : (

                <div className="space-y-4">

                  <div className="flex gap-2">

                    <input type="text" placeholder="Add single dish..."=

 className="flex-1 px-4 py-3 bg-slate-50 rounded-xl font-bold text-sm out=

line-none border focus:border-indigo-100" value={newDishName} onChange==

{(e) => setNewDishName(e.target.value)} onKeyDown={(e) => e.key ==

== 'Enter' && handleAddDishToLib()}/>

                    <button onClick={handleAddDishToLib} className="bg-=

indigo-600 text-white px-4 rounded-xl shadow-md"><Plus size={18}/></butto=

n>

                  </div>



                  <label className="flex items-center justify-center gap-=

3 px-5 py-4 bg-emerald-50 text-emerald-600 rounded-2xl border border-dashed=

 border-emerald-200 cursor-pointer">

                    <input type="file" accept=".xlsx,.xls,.csv" classNa=

me="hidden" onChange={handleExcelUpload} disabled={isImporting} />

                    <FileUp size={18}/><span className="text-[10px] fon=

t-black uppercase">{isImporting ? 'Processing...' : 'Bulk Upload'}</span>

                  </label>



                  <div className="space-y-2 pb-10">

                    {(dishes || []).filter(d => d.categoryId === cu=

rrentCategoryId).map(dish => (

                      <div key={dish.id} className="flex items-center j=

ustify-between p-4 bg-slate-50 rounded-2xl border border-slate-100 shadow-s=

m">

                        <span className="font-bold text-slate-700 text-xs=

 break-words pr-2">{dish.name}</span>

                        <div className="flex gap-2 flex-shrink-0">

                          <button onClick={() => deleteDoc(getHubRef('d=

ishes', dish.id))} className="text-slate-200 hover:text-rose-500 p-1"><Tr=

ash2 size={14}/></button>

                          {selectingFor && <button onClick={() => addDi=

shToMeal(selectingFor.type, dish.name)} className="bg-indigo-600 text-whi=

te px-3 py-1.5 rounded-xl font-black text-[9px] uppercase tracking-widest">=

ADD</button>}

                        </div>

                      </div>

                    ))}

                  </div>

                </div>

              )}

            </div>

          </div>

        </div>

      )}



      <nav className="fixed bottom-0 left-0 right-0 bg-white/90 backdrop-=

blur-xl border-t border-slate-100 px-10 py-5 pb-9 flex justify-between item=

s-center z-40 shadow-xl">

        <button onClick={() => setActiveTab('meals')} className={`fle=

x flex-col items-center gap-1.5 transition-all active:scale-90 ${activeTab =

=== 'meals' ? 'text-indigo-600' : 'text-slate-300'}`}>

          <Utensils size={26} strokeWidth={2.5}/><span className="tex=

t-[9px] font-black uppercase tracking-tighter">Meals</span>

        </button>

        <button onClick={() => setActiveTab('groceries')} className={=

`flex flex-col items-center gap-1.5 transition-all active:scale-90 ${active=

Tab === 'groceries' ? 'text-indigo-600' : 'text-slate-300'}`}>

          <ShoppingCart size={26} strokeWidth={2.5}/><span className==

"text-[9px] font-black uppercase tracking-tighter">Grocery</span>

        </button>

        <button onClick={() => setActiveTab('settings')} className={`=

flex flex-col items-center gap-1.5 transition-all active:scale-90 ${activeT=

ab === 'settings' ? 'text-indigo-600' : 'text-slate-300'}`}>

          <Fingerprint size={26} strokeWidth={2.5}/><span className="=

text-[9px] font-black uppercase tracking-tighter">Hub</span>

        </button>

      </nav>

    </div>

  );

}



```





--_000_OSZPR01MB7745437877B45974CE3B9A55FC202OSZPR01MB7745jpnp_

Content-Type: text/html; charset="Windows-1252"

Content-Transfer-Encoding: quoted-printable



<html>

<head>

<meta http-equiv="Content-Type" content="text/html; charset=Windows-1=

252">

</head>

<body>

<div style="font-family: Aptos, Aptos_MSFontService, -apple-system, Robot=

o, Arial, Helvetica, sans-serif; font-size: 12pt; color: rgb(33, 33, 33);" =

dir="auto">

```react</div>

<div style="font-family: Aptos, Aptos_MSFontService, -apple-system, Robot=

o, Arial, Helvetica, sans-serif; font-size: 12pt; color: rgb(33, 33, 33);" =

dir="auto">


<div style="font-family: Aptos, Aptos_MSFontService, -apple-system, Robot=

o, Arial, Helvetica, sans-serif; font-size: 12pt; color: rgb(33, 33, 33);" =

dir="auto">


<div style="font-family: Aptos, Aptos_MSFontService, -apple-system, Robot=

o, Arial, Helvetica, sans-serif; font-size: 12pt; color: rgb(33, 33, 33);" =

dir="auto">


<div style="font-family: Aptos, Aptos_MSFontService, -apple-system, Robot=

o, Arial, Helvetica, sans-serif; font-size: 12pt; color: rgb(33, 33, 33);" =

dir="auto">

&nbsp; getAuth,&nbsp;</div>

<div style="font-family: Aptos, Aptos_MSFontService, -apple-system, Robot=

o, Arial, Helvetica, sans-serif; font-size: 12pt; color: rgb(33, 33, 33);" =

dir="auto">

&nbsp; signInAnonymously,&nbsp;</div>

<div style="font-family: Aptos, Aptos_MSFontService, -apple-system, Robot=

o, Arial, Helvetica, sans-serif; font-size: 12pt; color: rgb(33, 33, 33);" =

dir="auto">

&nbsp; signInWithCustomToken,&nbsp;</div>

<div style="font-family: Aptos, Aptos_MSFontService, -apple-system, Robot=

o, Arial, Helvetica, sans-serif; font-size: 12pt; color: rgb(33, 33, 33);" =

dir="auto">

&nbsp; onAuthStateChanged&nbsp;</div>

<div style="font-family: Aptos, Aptos_MSFontService, -apple-system, Robot=

o, Arial, Helvetica, sans-serif; font-size: 12pt; color: rgb(33, 33, 33);" =

dir="auto">

} from 'firebase/auth';</div>

<div style="font-family: Aptos, Aptos_MSFontService, -apple-system, Robot=

o, Arial, Helvetica, sans-serif; font-size: 12pt; color: rgb(33, 33, 33);" =

dir="auto">


<div style="font-family: Aptos, Aptos_MSFontService, -apple-system, Robot=

o, Arial, Helvetica, sans-serif; font-size: 12pt; color: rgb(33, 33, 33);" =

dir="auto">

&nbsp; getFirestore,&nbsp;</div>

<div style="font-family: Aptos, Aptos_MSFontService, -apple-system, Robot=

o, Arial, Helvetica, sans-serif; font-size: 12pt; color: rgb(33, 33, 33);" =

dir="auto">

&nbsp; collection,&nbsp;</div>

<div style="font-family: Aptos, Aptos_MSFontService, -apple-system, Robot=

o, Arial, Helvetica, sans-serif; font-size: 12pt; color: rgb(33, 33, 33);" =

dir="auto">

&nbsp; doc,&nbsp;</div>

<div style="font-family: Aptos, Aptos_MSFontService, -apple-system, Robot=

o, Arial, Helvetica, sans-serif; font-size: 12pt; color: rgb(33, 33, 33);" =

dir="auto">

&nbsp; setDoc,&nbsp;</div>

<div style="font-family: Aptos, Aptos_MSFontService, -apple-system, Robot=

o, Arial, Helvetica, sans-serif; font-size: 12pt; color: rgb(33, 33, 33);" =

dir="auto">

&nbsp; getDoc,</div>

<div style="font-family: Aptos, Aptos_MSFontService, -apple-system, Robot=

o, Arial, Helvetica, sans-serif; font-size: 12pt; color: rgb(33, 33, 33);" =

dir="auto">

&nbsp; onSnapshot,&nbsp;</div>

<div style="font-family: Aptos, Aptos_MSFontService, -apple-system, Robot=

o, Arial, Helvetica, sans-serif; font-size: 12pt; color: rgb(33, 33, 33);" =

dir="auto">

&nbsp; addDoc,&nbsp;</div>

<div style="font-family: Aptos, Aptos_MSFontService, -apple-system, Robot=

o, Arial, Helvetica, sans-serif; font-size: 12pt; color: rgb(33, 33, 33);" =

dir="auto">

&nbsp; updateDoc,&nbsp;</div>

<div style="font-family: Aptos, Aptos_MSFontService, -apple-system, Robot=

o, Arial, Helvetica, sans-serif; font-size: 12pt; color: rgb(33, 33, 33);" =

dir="auto">

&nbsp; deleteDoc,</div>

<div style="font-family: Aptos, Aptos_MSFontService, -apple-system, Robot=

o, Arial, Helvetica, sans-serif; font-size: 12pt; color: rgb(33, 33, 33);" =

dir="auto">

&nbsp; writeBatch</div>

<div style="font-family: Aptos, Aptos_MSFontService, -apple-system, Robot=

o, Arial, Helvetica, sans-serif; font-size: 12pt; color: rgb(33, 33, 33);" =

dir="auto">

} from 'firebase/firestore';</div>

<div style="font-family: Aptos, Aptos_MSFontService, -apple-system, Robot=

o, Arial, Helvetica, sans-serif; font-size: 12pt; color: rgb(33, 33, 33);" =

dir="auto">


<div style="font-family: Aptos, Aptos_MSFontService, -apple-system, Robot=

o, Arial, Helvetica, sans-serif; font-size: 12pt; color: rgb(33, 33, 33);" =

dir="auto">

&nbsp; Utensils,&nbsp;</div>

<div style="font-family: Aptos, Aptos_MSFontService, -apple-system, Robot=

o, Arial, Helvetica, sans-serif; font-size: 12pt; color: rgb(33, 33, 33);" =

dir="auto">

&nbsp; ShoppingCart,&nbsp;</div>

<div style="font-family: Aptos, Aptos_MSFontService, -apple-system, Robot=

o, Arial, Helvetica, sans-serif; font-size: 12pt; color: rgb(33, 33, 33);" =

dir="auto">

&nbsp; Plus,&nbsp;</div>

<div style="font-family: Aptos, Aptos_MSFontService, -apple-system, Robot=

o, Arial, Helvetica, sans-serif; font-size: 12pt; color: rgb(33, 33, 33);" =

dir="auto">

&nbsp; CheckCircle2,&nbsp;</div>

<div style="font-family: Aptos, Aptos_MSFontService, -apple-system, Robot=

o, Arial, Helvetica, sans-serif; font-size: 12pt; color: rgb(33, 33, 33);" =

dir="auto">

&nbsp; Circle,&nbsp;</div>

<div style="font-family: Aptos, Aptos_MSFontService, -apple-system, Robot=

o, Arial, Helvetica, sans-serif; font-size: 12pt; color: rgb(33, 33, 33);" =

dir="auto">

&nbsp; Trash2,&nbsp;</div>

<div style="font-family: Aptos, Aptos_MSFontService, -apple-system, Robot=

o, Arial, Helvetica, sans-serif; font-size: 12pt; color: rgb(33, 33, 33);" =

dir="auto">

&nbsp; RefreshCw,</div>

<div style="font-family: Aptos, Aptos_MSFontService, -apple-system, Robot=

o, Arial, Helvetica, sans-serif; font-size: 12pt; color: rgb(33, 33, 33);" =

dir="auto">

&nbsp; ChevronLeft,</div>

<div style="font-family: Aptos, Aptos_MSFontService, -apple-system, Robot=

o, Arial, Helvetica, sans-serif; font-size: 12pt; color: rgb(33, 33, 33);" =

dir="auto">

&nbsp; ChevronRight,</div>

<div style="font-family: Aptos, Aptos_MSFontService, -apple-system, Robot=

o, Arial, Helvetica, sans-serif; font-size: 12pt; color: rgb(33, 33, 33);" =

dir="auto">

&nbsp; Sparkles,</div>

<div style="font-family: Aptos, Aptos_MSFontService, -apple-system, Robot=

o, Arial, Helvetica, sans-serif; font-size: 12pt; color: rgb(33, 33, 33);" =

dir="auto">

&nbsp; X,</div>

<div style="font-family: Aptos, Aptos_MSFontService, -apple-system, Robot=

o, Arial, Helvetica, sans-serif; font-size: 12pt; color: rgb(33, 33, 33);" =

dir="auto">

&nbsp; Check,</div>

<div style="font-family: Aptos, Aptos_MSFontService, -apple-system, Robot=

o, Arial, Helvetica, sans-serif; font-size: 12pt; color: rgb(33, 33, 33);" =

dir="auto">

&nbsp; Home,</div>

<div style="font-family: Aptos, Aptos_MSFontService, -apple-system, Robot=

o, Arial, Helvetica, sans-serif; font-size: 12pt; color: rgb(33, 33, 33);" =

dir="auto">

&nbsp; Fingerprint,</div>

<div style="font-family: Aptos, Aptos_MSFontService, -apple-system, Robot=

o, Arial, Helvetica, sans-serif; font-size: 12pt; color: rgb(33, 33, 33);" =

dir="auto">

&nbsp; ShieldCheck,</div>

<div style="font-family: Aptos, Aptos_MSFontService, -apple-system, Robot=

o, Arial, Helvetica, sans-serif; font-size: 12pt; color: rgb(33, 33, 33);" =

dir="auto">

&nbsp; FileUp,</div>

<div style="font-family: Aptos, Aptos_MSFontService, -apple-system, Robot=

o, Arial, Helvetica, sans-serif; font-size: 12pt; color: rgb(33, 33, 33);" =

dir="auto">

&nbsp; PlusCircle,</div>

<div style="font-family: Aptos, Aptos_MSFontService, -apple-system, Robot=

o, Arial, Helvetica, sans-serif; font-size: 12pt; color: rgb(33, 33, 33);" =

dir="auto">

&nbsp; KeyRound,</div>

<div style="font-family: Aptos, Aptos_MSFontService, -apple-system, Robot=

o, Arial, Helvetica, sans-serif; font-size: 12pt; color: rgb(33, 33, 33);" =

dir="auto">

&nbsp; Zap,</div>

<div style="font-family: Aptos, Aptos_MSFontService, -apple-system, Robot=

o, Arial, Helvetica, sans-serif; font-size: 12pt; color: rgb(33, 33, 33);" =

dir="auto">

&nbsp; FolderPlus,</div>

<div style="font-family: Aptos, Aptos_MSFontService, -apple-system, Robot=

o, Arial, Helvetica, sans-serif; font-size: 12pt; color: rgb(33, 33, 33);" =

dir="auto">

&nbsp; ChevronRight as ChevronRightIcon,</div>

<div style="font-family: Aptos, Aptos_MSFontService, -apple-system, Robot=

o, Arial, Helvetica, sans-serif; font-size: 12pt; color: rgb(33, 33, 33);" =

dir="auto">

&nbsp; Tag,</div>

<div style="font-family: Aptos, Aptos_MSFontService, -apple-system, Robot=

o, Arial, Helvetica, sans-serif; font-size: 12pt; color: rgb(33, 33, 33);" =

dir="auto">

&nbsp; LayoutGrid,</div>

<div style="font-family: Aptos, Aptos_MSFontService, -apple-system, Robot=

o, Arial, Helvetica, sans-serif; font-size: 12pt; color: rgb(33, 33, 33);" =

dir="auto">

&nbsp; Info,</div>

<div style="font-family: Aptos, Aptos_MSFontService, -apple-system, Robot=

o, Arial, Helvetica, sans-serif; font-size: 12pt; color: rgb(33, 33, 33);" =

dir="auto">

&nbsp; StickyNote,</div>

<div style="font-family: Aptos, Aptos_MSFontService, -apple-system, Robot=

o, Arial, Helvetica, sans-serif; font-size: 12pt; color: rgb(33, 33, 33);" =

dir="auto">

&nbsp; Send</div>

<div style="font-family: Aptos, Aptos_MSFontService, -apple-system, Robot=

o, Arial, Helvetica, sans-serif; font-size: 12pt; color: rgb(33, 33, 33);" =

dir="auto">

} from 'lucide-react';</div>

<div style="font-family: Aptos, Aptos_MSFontService, -apple-system, Robot=

o, Arial, Helvetica, sans-serif; font-size: 12pt; color: rgb(33, 33, 33);" =

dir="auto">

<br>

</div>

<div style="font-family: Aptos, Aptos_MSFontService, -apple-system, Robot=

o, Arial, Helvetica, sans-serif; font-size: 12pt; color: rgb(33, 33, 33);" =

dir="auto">

const XLSX_SCRIPT_URL = &quot;https://cdnjs.cloudflare.com/ajax/libs/xlsx=

/0.18.5/xlsx.full.min.js&quot;;</div>

<div style="font-family: Aptos, Aptos_MSFontService, -apple-system, Robot=

o, Arial, Helvetica, sans-serif; font-size: 12pt; color: rgb(33, 33, 33);" =

dir="auto">

const APP_VERSION = &quot;v1.5.6&quot;;</div>

<div style="font-family: Aptos, Aptos_MSFontService, -apple-system, Robot=

o, Arial, Helvetica, sans-serif; font-size: 12pt; color: rgb(33, 33, 33);" =

dir="auto">

<br>

</div>

<div style="font-family: Aptos, Aptos_MSFontService, -apple-system, Robot=

o, Arial, Helvetica, sans-serif; font-size: 12pt; color: rgb(33, 33, 33);" =

dir="auto">

const getFirebaseConfig = () =&gt; {</div>

<div style="font-family: Aptos, Aptos_MSFontService, -apple-system, Robot=

o, Arial, Helvetica, sans-serif; font-size: 12pt; color: rgb(33, 33, 33);" =

dir="auto">

&nbsp; try {</div>

<div style="font-family: Aptos, Aptos_MSFontService, -apple-system, Robot=

o, Arial, Helvetica, sans-serif; font-size: 12pt; color: rgb(33, 33, 33);" =

dir="auto">

&nbsp; &nbsp; return typeof __firebase_config !== 'undefined' ? JSON.pa=

rse(__firebase_config) : null;</div>

<div style="font-family: Aptos, Aptos_MSFontService, -apple-system, Robot=

o, Arial, Helvetica, sans-serif; font-size: 12pt; color: rgb(33, 33, 33);" =

dir="auto">

&nbsp; } catch (e) { return null; }</div>

<div style="font-family: Aptos, Aptos_MSFontService, -apple-system, Robot=

o, Arial, Helvetica, sans-serif; font-size: 12pt; color: rgb(33, 33, 33);" =

dir="auto">

};</div>

<div style="font-family: Aptos, Aptos_MSFontService, -apple-system, Robot=

o, Arial, Helvetica, sans-serif; font-size: 12pt; color: rgb(33, 33, 33);" =

dir="auto">

<br>

</div>

<div style="font-family: Aptos, Aptos_MSFontService, -apple-system, Robot=

o, Arial, Helvetica, sans-serif; font-size: 12pt; color: rgb(33, 33, 33);" =

dir="auto">

const MEAL_TYPES = ['Breakfast', 'Lunch', 'Snack', 'Dinner'];</div>

<div style="font-family: Aptos, Aptos_MSFontService, -apple-system, Robot=

o, Arial, Helvetica, sans-serif; font-size: 12pt; color: rgb(33, 33, 33);" =

dir="auto">

const SUGGESTED_MEALS = {</div>

<div style="font-family: Aptos, Aptos_MSFontService, -apple-system, Robot=

o, Arial, Helvetica, sans-serif; font-size: 12pt; color: rgb(33, 33, 33);" =

dir="auto">

&nbsp; Breakfast: ['Avocado Toast', 'Pancakes', 'Scrambled Eggs'],</div>

<div style="font-family: Aptos, Aptos_MSFontService, -apple-system, Robot=

o, Arial, Helvetica, sans-serif; font-size: 12pt; color: rgb(33, 33, 33);" =

dir="auto">

&nbsp; Lunch: ['Chicken Caesar Salad', 'Tomato Soup', 'Turkey Club'],</div>

<div style="font-family: Aptos, Aptos_MSFontService, -apple-system, Robot=

o, Arial, Helvetica, sans-serif; font-size: 12pt; color: rgb(33, 33, 33);" =

dir="auto">

&nbsp; Snack: ['Fruit Bowl', 'Yogurt', 'Nuts', 'Hummus &amp; Carrots'],</di=

v>

<div style="font-family: Aptos, Aptos_MSFontService, -apple-system, Robot=

o, Arial, Helvetica, sans-serif; font-size: 12pt; color: rgb(33, 33, 33);" =

dir="auto">

&nbsp; Dinner: ['Spaghetti Carbonara', 'Grilled Salmon', 'Thai Green Curry'=

]</div>

<div style="font-family: Aptos, Aptos_MSFontService, -apple-system, Robot=

o, Arial, Helvetica, sans-serif; font-size: 12pt; color: rgb(33, 33, 33);" =

dir="auto">

};</div>

<div style="font-family: Aptos, Aptos_MSFontService, -apple-system, Robot=

o, Arial, Helvetica, sans-serif; font-size: 12pt; color: rgb(33, 33, 33);" =

dir="auto">

<br>

</div>

<div style="font-family: Aptos, Aptos_MSFontService, -apple-system, Robot=

o, Arial, Helvetica, sans-serif; font-size: 12pt; color: rgb(33, 33, 33);" =

dir="auto">


<div style="font-family: Aptos, Aptos_MSFontService, -apple-system, Robot=

o, Arial, Helvetica, sans-serif; font-size: 12pt; color: rgb(33, 33, 33);" =

dir="auto">

&nbsp; const [isConfigReady, setIsConfigReady] = useState(false);</div>

<div style="font-family: Aptos, Aptos_MSFontService, -apple-system, Robot=

o, Arial, Helvetica, sans-serif; font-size: 12pt; color: rgb(33, 33, 33);" =

dir="auto">

&nbsp; const [user, setUser] = useState(null);</div>

<div style="font-family: Aptos, Aptos_MSFontService, -apple-system, Robot=

o, Arial, Helvetica, sans-serif; font-size: 12pt; color: rgb(33, 33, 33);" =

dir="auto">

&nbsp; const [loginError, setLoginError] = useState(null);</div>

<div style="font-family: Aptos, Aptos_MSFontService, -apple-system, Robot=

o, Arial, Helvetica, sans-serif; font-size: 12pt; color: rgb(33, 33, 33);" =

dir="auto">

&nbsp; const [appId] = useState(() =&gt; typeof __app_id !== 'undef=

ined' ? __app_id : 'default-app-id');</div>

<div style="font-family: Aptos, Aptos_MSFontService, -apple-system, Robot=

o, Arial, Helvetica, sans-serif; font-size: 12pt; color: rgb(33, 33, 33);" =

dir="auto">

&nbsp; const [isXlsxLoaded, setIsXlsxLoaded] = useState(false);</div>

<div style="font-family: Aptos, Aptos_MSFontService, -apple-system, Robot=

o, Arial, Helvetica, sans-serif; font-size: 12pt; color: rgb(33, 33, 33);" =

dir="auto">

&nbsp;&nbsp;</div>

<div style="font-family: Aptos, Aptos_MSFontService, -apple-system, Robot=

o, Arial, Helvetica, sans-serif; font-size: 12pt; color: rgb(33, 33, 33);" =

dir="auto">

&nbsp; const [activeProfile, setActiveProfile] = useState(() =&gt; {</d=

iv>

<div style="font-family: Aptos, Aptos_MSFontService, -apple-system, Robot=

o, Arial, Helvetica, sans-serif; font-size: 12pt; color: rgb(33, 33, 33);" =

dir="auto">

&nbsp; &nbsp; const saved = localStorage.getItem('family_app_profile');</=

div>

<div style="font-family: Aptos, Aptos_MSFontService, -apple-system, Robot=

o, Arial, Helvetica, sans-serif; font-size: 12pt; color: rgb(33, 33, 33);" =

dir="auto">

&nbsp; &nbsp; try { return saved ? JSON.parse(saved) : null; } catch { retu=

rn null; }</div>

<div style="font-family: Aptos, Aptos_MSFontService, -apple-system, Robot=

o, Arial, Helvetica, sans-serif; font-size: 12pt; color: rgb(33, 33, 33);" =

dir="auto">

&nbsp; });</div>

<div style="font-family: Aptos, Aptos_MSFontService, -apple-system, Robot=

o, Arial, Helvetica, sans-serif; font-size: 12pt; color: rgb(33, 33, 33);" =

dir="auto">

&nbsp; const [inputPhone, setInputPhone] = useState(() =&gt; localStora=

ge.getItem('family_app_phone') || '');</div>

<div style="font-family: Aptos, Aptos_MSFontService, -apple-system, Robot=

o, Arial, Helvetica, sans-serif; font-size: 12pt; color: rgb(33, 33, 33);" =

dir="auto">

&nbsp; const [inputProfileName, setInputProfileName] = useState(() =&gt=

; {</div>

<div style="font-family: Aptos, Aptos_MSFontService, -apple-system, Robot=

o, Arial, Helvetica, sans-serif; font-size: 12pt; color: rgb(33, 33, 33);" =

dir="auto">

&nbsp; &nbsp; const saved = localStorage.getItem('family_app_profile');</=

div>

<div style="font-family: Aptos, Aptos_MSFontService, -apple-system, Robot=

o, Arial, Helvetica, sans-serif; font-size: 12pt; color: rgb(33, 33, 33);" =

dir="auto">

&nbsp; &nbsp; try { return saved ? JSON.parse(saved).name : ''; } catch { r=

eturn ''; }</div>

<div style="font-family: Aptos, Aptos_MSFontService, -apple-system, Robot=

o, Arial, Helvetica, sans-serif; font-size: 12pt; color: rgb(33, 33, 33);" =

dir="auto">

&nbsp; });</div>

<div style="font-family: Aptos, Aptos_MSFontService, -apple-system, Robot=

o, Arial, Helvetica, sans-serif; font-size: 12pt; color: rgb(33, 33, 33);" =

dir="auto">

&nbsp; const [quickCode, setQuickCode] = useState('');</div>

<div style="font-family: Aptos, Aptos_MSFontService, -apple-system, Robot=

o, Arial, Helvetica, sans-serif; font-size: 12pt; color: rgb(33, 33, 33);" =

dir="auto">

&nbsp; const [isQuickLoginMode, setIsQuickLoginMode] = useState(true);</d=

iv>

<div style="font-family: Aptos, Aptos_MSFontService, -apple-system, Robot=

o, Arial, Helvetica, sans-serif; font-size: 12pt; color: rgb(33, 33, 33);" =

dir="auto">

<br>

</div>

<div style="font-family: Aptos, Aptos_MSFontService, -apple-system, Robot=

o, Arial, Helvetica, sans-serif; font-size: 12pt; color: rgb(33, 33, 33);" =

dir="auto">

&nbsp; const [activeTab, setActiveTab] = useState('meals');</div>

<div style="font-family: Aptos, Aptos_MSFontService, -apple-system, Robot=

o, Arial, Helvetica, sans-serif; font-size: 12pt; color: rgb(33, 33, 33);" =

dir="auto">

&nbsp; const [meals, setMeals] = useState([]);</div>

<div style="font-family: Aptos, Aptos_MSFontService, -apple-system, Robot=

o, Arial, Helvetica, sans-serif; font-size: 12pt; color: rgb(33, 33, 33);" =

dir="auto">

&nbsp; const [groceries, setGroceries] = useState([]);</div>

<div style="font-family: Aptos, Aptos_MSFontService, -apple-system, Robot=

o, Arial, Helvetica, sans-serif; font-size: 12pt; color: rgb(33, 33, 33);" =

dir="auto">

&nbsp; const [dishes, setDishes] = useState([]);</div>

<div style="font-family: Aptos, Aptos_MSFontService, -apple-system, Robot=

o, Arial, Helvetica, sans-serif; font-size: 12pt; color: rgb(33, 33, 33);" =

dir="auto">

&nbsp; const [categories, setCategories] = useState([]);</div>

<div style="font-family: Aptos, Aptos_MSFontService, -apple-system, Robot=

o, Arial, Helvetica, sans-serif; font-size: 12pt; color: rgb(33, 33, 33);" =

dir="auto">

&nbsp; const [selectedDate, setSelectedDate] = useState(new Date().toISOS=

tring().split('T')[0]);</div>

<div style="font-family: Aptos, Aptos_MSFontService, -apple-system, Robot=

o, Arial, Helvetica, sans-serif; font-size: 12pt; color: rgb(33, 33, 33);" =

dir="auto">

&nbsp;&nbsp;</div>

<div style="font-family: Aptos, Aptos_MSFontService, -apple-system, Robot=

o, Arial, Helvetica, sans-serif; font-size: 12pt; color: rgb(33, 33, 33);" =

dir="auto">

&nbsp; const [isLibraryOpen, setIsLibraryOpen] = useState(false);</div>

<div style="font-family: Aptos, Aptos_MSFontService, -apple-system, Robot=

o, Arial, Helvetica, sans-serif; font-size: 12pt; color: rgb(33, 33, 33);" =

dir="auto">

&nbsp; const [currentCategoryId, setCurrentCategoryId] = useState(null);<=

/div>

<div style="font-family: Aptos, Aptos_MSFontService, -apple-system, Robot=

o, Arial, Helvetica, sans-serif; font-size: 12pt; color: rgb(33, 33, 33);" =

dir="auto">

&nbsp; const [newCategoryName, setNewCategoryName] = useState('');</div>

<div style="font-family: Aptos, Aptos_MSFontService, -apple-system, Robot=

o, Arial, Helvetica, sans-serif; font-size: 12pt; color: rgb(33, 33, 33);" =

dir="auto">

&nbsp; const [newDishName, setNewDishName] = useState('');</div>

<div style="font-family: Aptos, Aptos_MSFontService, -apple-system, Robot=

o, Arial, Helvetica, sans-serif; font-size: 12pt; color: rgb(33, 33, 33);" =

dir="auto">

&nbsp; const [selectingFor, setSelectingFor] = useState(null);</div>

<div style="font-family: Aptos, Aptos_MSFontService, -apple-system, Robot=

o, Arial, Helvetica, sans-serif; font-size: 12pt; color: rgb(33, 33, 33);" =

dir="auto">

&nbsp; const [isImporting, setIsImporting] = useState(false);</div>

<div style="font-family: Aptos, Aptos_MSFontService, -apple-system, Robot=

o, Arial, Helvetica, sans-serif; font-size: 12pt; color: rgb(33, 33, 33);" =

dir="auto">

<br>

</div>

<div style="font-family: Aptos, Aptos_MSFontService, -apple-system, Robot=

o, Arial, Helvetica, sans-serif; font-size: 12pt; color: rgb(33, 33, 33);" =

dir="auto">

&nbsp; const [editingRemark, setEditingRemark] = useState(null);</div>

<div style="font-family: Aptos, Aptos_MSFontService, -apple-system, Robot=

o, Arial, Helvetica, sans-serif; font-size: 12pt; color: rgb(33, 33, 33);" =

dir="auto">

&nbsp; const [manualInputs, setManualInputs] = useState({});</div>

<div style="font-family: Aptos, Aptos_MSFontService, -apple-system, Robot=

o, Arial, Helvetica, sans-serif; font-size: 12pt; color: rgb(33, 33, 33);" =

dir="auto">

&nbsp; const [newPin, setNewPin] = useState('');</div>

<div style="font-family: Aptos, Aptos_MSFontService, -apple-system, Robot=

o, Arial, Helvetica, sans-serif; font-size: 12pt; color: rgb(33, 33, 33);" =

dir="auto">

&nbsp; const [newGrocery, setNewGrocery] = useState('');</div>

<div style="font-family: Aptos, Aptos_MSFontService, -apple-system, Robot=

o, Arial, Helvetica, sans-serif; font-size: 12pt; color: rgb(33, 33, 33);" =

dir="auto">

<br>

</div>

<div style="font-family: Aptos, Aptos_MSFontService, -apple-system, Robot=

o, Arial, Helvetica, sans-serif; font-size: 12pt; color: rgb(33, 33, 33);" =

dir="auto">

&nbsp; const firebaseRefs = useMemo(() =&gt; {</div>

<div style="font-family: Aptos, Aptos_MSFontService, -apple-system, Robot=

o, Arial, Helvetica, sans-serif; font-size: 12pt; color: rgb(33, 33, 33);" =

dir="auto">

&nbsp; &nbsp; const config = getFirebaseConfig();</div>

<div style="font-family: Aptos, Aptos_MSFontService, -apple-system, Robot=

o, Arial, Helvetica, sans-serif; font-size: 12pt; color: rgb(33, 33, 33);" =

dir="auto">

&nbsp; &nbsp; if (!config) return null;</div>

<div style="font-family: Aptos, Aptos_MSFontService, -apple-system, Robot=

o, Arial, Helvetica, sans-serif; font-size: 12pt; color: rgb(33, 33, 33);" =

dir="auto">

&nbsp; &nbsp; const app = getApps().length &gt; 0 ? getApp() : initialize=

App(config);</div>

<div style="font-family: Aptos, Aptos_MSFontService, -apple-system, Robot=

o, Arial, Helvetica, sans-serif; font-size: 12pt; color: rgb(33, 33, 33);" =

dir="auto">

&nbsp; &nbsp; return { auth: getAuth(app), db: getFirestore(app) };</div>

<div style="font-family: Aptos, Aptos_MSFontService, -apple-system, Robot=

o, Arial, Helvetica, sans-serif; font-size: 12pt; color: rgb(33, 33, 33);" =

dir="auto">

&nbsp; }, []);</div>

<div style="font-family: Aptos, Aptos_MSFontService, -apple-system, Robot=

o, Arial, Helvetica, sans-serif; font-size: 12pt; color: rgb(33, 33, 33);" =

dir="auto">

<br>

</div>

<div style="font-family: Aptos, Aptos_MSFontService, -apple-system, Robot=

o, Arial, Helvetica, sans-serif; font-size: 12pt; color: rgb(33, 33, 33);" =

dir="auto">

&nbsp; useEffect(() =&gt; {</div>

<div style="font-family: Aptos, Aptos_MSFontService, -apple-system, Robot=

o, Arial, Helvetica, sans-serif; font-size: 12pt; color: rgb(33, 33, 33);" =

dir="auto">

&nbsp; &nbsp; if (window.XLSX) { setIsXlsxLoaded(true); return; }</div>

<div style="font-family: Aptos, Aptos_MSFontService, -apple-system, Robot=

o, Arial, Helvetica, sans-serif; font-size: 12pt; color: rgb(33, 33, 33);" =

dir="auto">

&nbsp; &nbsp; const script = document.createElement(&quot;script&quot;);<=

/div>

<div style="font-family: Aptos, Aptos_MSFontService, -apple-system, Robot=

o, Arial, Helvetica, sans-serif; font-size: 12pt; color: rgb(33, 33, 33);" =

dir="auto">

&nbsp; &nbsp; script.src = XLSX_SCRIPT_URL; script.async = true;</div>

<div style="font-family: Aptos, Aptos_MSFontService, -apple-system, Robot=

o, Arial, Helvetica, sans-serif; font-size: 12pt; color: rgb(33, 33, 33);" =

dir="auto">

&nbsp; &nbsp; script.onload = () =&gt; setIsXlsxLoaded(true);</div>

<div style="font-family: Aptos, Aptos_MSFontService, -apple-system, Robot=

o, Arial, Helvetica, sans-serif; font-size: 12pt; color: rgb(33, 33, 33);" =

dir="auto">

&nbsp; &nbsp; document.head.appendChild(script);</div>

<div style="font-family: Aptos, Aptos_MSFontService, -apple-system, Robot=

o, Arial, Helvetica, sans-serif; font-size: 12pt; color: rgb(33, 33, 33);" =

dir="auto">

&nbsp; }, []);</div>

<div style="font-family: Aptos, Aptos_MSFontService, -apple-system, Robot=

o, Arial, Helvetica, sans-serif; font-size: 12pt; color: rgb(33, 33, 33);" =

dir="auto">

<br>

</div>

<div style="font-family: Aptos, Aptos_MSFontService, -apple-system, Robot=

o, Arial, Helvetica, sans-serif; font-size: 12pt; color: rgb(33, 33, 33);" =

dir="auto">

&nbsp; useEffect(() =&gt; {</div>

<div style="font-family: Aptos, Aptos_MSFontService, -apple-system, Robot=

o, Arial, Helvetica, sans-serif; font-size: 12pt; color: rgb(33, 33, 33);" =

dir="auto">

&nbsp; &nbsp; if (!firebaseRefs) return;</div>

<div style="font-family: Aptos, Aptos_MSFontService, -apple-system, Robot=

o, Arial, Helvetica, sans-serif; font-size: 12pt; color: rgb(33, 33, 33);" =

dir="auto">

&nbsp; &nbsp; const { auth } = firebaseRefs;</div>

<div style="font-family: Aptos, Aptos_MSFontService, -apple-system, Robot=

o, Arial, Helvetica, sans-serif; font-size: 12pt; color: rgb(33, 33, 33);" =

dir="auto">

&nbsp; &nbsp; const initAuth = async () =&gt; {</div>

<div style="font-family: Aptos, Aptos_MSFontService, -apple-system, Robot=

o, Arial, Helvetica, sans-serif; font-size: 12pt; color: rgb(33, 33, 33);" =

dir="auto">

&nbsp; &nbsp; &nbsp; if (typeof __initial_auth_token !== 'undefined' &a=

mp;&amp; __initial_auth_token) {</div>

<div style="font-family: Aptos, Aptos_MSFontService, -apple-system, Robot=

o, Arial, Helvetica, sans-serif; font-size: 12pt; color: rgb(33, 33, 33);" =

dir="auto">

&nbsp; &nbsp; &nbsp; &nbsp; await signInWithCustomToken(auth, __initial_aut=

h_token).catch(() =&gt; signInAnonymously(auth));</div>

<div style="font-family: Aptos, Aptos_MSFontService, -apple-system, Robot=

o, Arial, Helvetica, sans-serif; font-size: 12pt; color: rgb(33, 33, 33);" =

dir="auto">

&nbsp; &nbsp; &nbsp; } else {</div>

<div style="font-family: Aptos, Aptos_MSFontService, -apple-system, Robot=

o, Arial, Helvetica, sans-serif; font-size: 12pt; color: rgb(33, 33, 33);" =

dir="auto">

&nbsp; &nbsp; &nbsp; &nbsp; await signInAnonymously(auth);</div>

<div style="font-family: Aptos, Aptos_MSFontService, -apple-system, Robot=

o, Arial, Helvetica, sans-serif; font-size: 12pt; color: rgb(33, 33, 33);" =

dir="auto">

&nbsp; &nbsp; &nbsp; }</div>

<div style="font-family: Aptos, Aptos_MSFontService, -apple-system, Robot=

o, Arial, Helvetica, sans-serif; font-size: 12pt; color: rgb(33, 33, 33);" =

dir="auto">

&nbsp; &nbsp; };</div>

<div style="font-family: Aptos, Aptos_MSFontService, -apple-system, Robot=

o, Arial, Helvetica, sans-serif; font-size: 12pt; color: rgb(33, 33, 33);" =

dir="auto">

&nbsp; &nbsp; initAuth();</div>

<div style="font-family: Aptos, Aptos_MSFontService, -apple-system, Robot=

o, Arial, Helvetica, sans-serif; font-size: 12pt; color: rgb(33, 33, 33);" =

dir="auto">

&nbsp; &nbsp; return onAuthStateChanged(auth, (u) =&gt; {</div>

<div style="font-family: Aptos, Aptos_MSFontService, -apple-system, Robot=

o, Arial, Helvetica, sans-serif; font-size: 12pt; color: rgb(33, 33, 33);" =

dir="auto">

&nbsp; &nbsp; &nbsp; setUser(u);</div>

<div style="font-family: Aptos, Aptos_MSFontService, -apple-system, Robot=

o, Arial, Helvetica, sans-serif; font-size: 12pt; color: rgb(33, 33, 33);" =

dir="auto">

&nbsp; &nbsp; &nbsp; setIsConfigReady(true);</div>

<div style="font-family: Aptos, Aptos_MSFontService, -apple-system, Robot=

o, Arial, Helvetica, sans-serif; font-size: 12pt; color: rgb(33, 33, 33);" =

dir="auto">

&nbsp; &nbsp; });</div>

<div style="font-family: Aptos, Aptos_MSFontService, -apple-system, Robot=

o, Arial, Helvetica, sans-serif; font-size: 12pt; color: rgb(33, 33, 33);" =

dir="auto">

&nbsp; }, [firebaseRefs]);</div>

<div style="font-family: Aptos, Aptos_MSFontService, -apple-system, Robot=

o, Arial, Helvetica, sans-serif; font-size: 12pt; color: rgb(33, 33, 33);" =

dir="auto">

<br>

</div>

<div style="font-family: Aptos, Aptos_MSFontService, -apple-system, Robot=

o, Arial, Helvetica, sans-serif; font-size: 12pt; color: rgb(33, 33, 33);" =

dir="auto">

&nbsp; useEffect(() =&gt; {</div>

<div style="font-family: Aptos, Aptos_MSFontService, -apple-system, Robot=

o, Arial, Helvetica, sans-serif; font-size: 12pt; color: rgb(33, 33, 33);" =

dir="auto">

&nbsp; &nbsp; if (!user || !activeProfile || !firebaseRefs) return;</div>

<div style="font-family: Aptos, Aptos_MSFontService, -apple-system, Robot=

o, Arial, Helvetica, sans-serif; font-size: 12pt; color: rgb(33, 33, 33);" =

dir="auto">

&nbsp; &nbsp; const { db } = firebaseRefs;</div>

<div style="font-family: Aptos, Aptos_MSFontService, -apple-system, Robot=

o, Arial, Helvetica, sans-serif; font-size: 12pt; color: rgb(33, 33, 33);" =

dir="auto">

&nbsp; &nbsp; const root = ['artifacts', appId, 'public', 'data', 'hubs',=

 activeProfile.hubKey];</div>

<div style="font-family: Aptos, Aptos_MSFontService, -apple-system, Robot=

o, Arial, Helvetica, sans-serif; font-size: 12pt; color: rgb(33, 33, 33);" =

dir="auto">

&nbsp; &nbsp;&nbsp;</div>

<div style="font-family: Aptos, Aptos_MSFontService, -apple-system, Robot=

o, Arial, Helvetica, sans-serif; font-size: 12pt; color: rgb(33, 33, 33);" =

dir="auto">

&nbsp; &nbsp; const subs = [</div>

<div style="font-family: Aptos, Aptos_MSFontService, -apple-system, Robot=

o, Arial, Helvetica, sans-serif; font-size: 12pt; color: rgb(33, 33, 33);" =

dir="auto">

&nbsp; &nbsp; &nbsp; onSnapshot(collection(db, ...root, 'meals'), (s) =&g=

t; setMeals(s.docs.map(d =&gt; ({ id: d.id, ...d.data() })))),</div>

<div style="font-family: Aptos, Aptos_MSFontService, -apple-system, Robot=

o, Arial, Helvetica, sans-serif; font-size: 12pt; color: rgb(33, 33, 33);" =

dir="auto">

&nbsp; &nbsp; &nbsp; onSnapshot(collection(db, ...root, 'groceries'), (s) =

=&gt; setGroceries(s.docs.map(d =&gt; ({ id: d.id, ...d.data() })))),</=

div>

<div style="font-family: Aptos, Aptos_MSFontService, -apple-system, Robot=

o, Arial, Helvetica, sans-serif; font-size: 12pt; color: rgb(33, 33, 33);" =

dir="auto">

&nbsp; &nbsp; &nbsp; onSnapshot(collection(db, ...root, 'dishes'), (s) =&=

gt; setDishes(s.docs.map(d =&gt; ({ id: d.id, ...d.data() })))),</div>

<div style="font-family: Aptos, Aptos_MSFontService, -apple-system, Robot=

o, Arial, Helvetica, sans-serif; font-size: 12pt; color: rgb(33, 33, 33);" =

dir="auto">

&nbsp; &nbsp; &nbsp; onSnapshot(collection(db, ...root, 'categories'), (s) =

=&gt; setCategories(s.docs.map(d =&gt; ({ id: d.id, ...d.data() }))))</=

div>

<div style="font-family: Aptos, Aptos_MSFontService, -apple-system, Robot=

o, Arial, Helvetica, sans-serif; font-size: 12pt; color: rgb(33, 33, 33);" =

dir="auto">

&nbsp; &nbsp; ];</div>

<div style="font-family: Aptos, Aptos_MSFontService, -apple-system, Robot=

o, Arial, Helvetica, sans-serif; font-size: 12pt; color: rgb(33, 33, 33);" =

dir="auto">

&nbsp; &nbsp; return () =&gt; subs.forEach(unsub =&gt; unsub());</div>

<div style="font-family: Aptos, Aptos_MSFontService, -apple-system, Robot=

o, Arial, Helvetica, sans-serif; font-size: 12pt; color: rgb(33, 33, 33);" =

dir="auto">

&nbsp; }, [user, activeProfile, firebaseRefs, appId]);</div>

<div style="font-family: Aptos, Aptos_MSFontService, -apple-system, Robot=

o, Arial, Helvetica, sans-serif; font-size: 12pt; color: rgb(33, 33, 33);" =

dir="auto">

<br>

</div>

<div style="font-family: Aptos, Aptos_MSFontService, -apple-system, Robot=

o, Arial, Helvetica, sans-serif; font-size: 12pt; color: rgb(33, 33, 33);" =

dir="auto">

&nbsp; const getHubRef = (col, docId = null) =&gt; {</div>

<div style="font-family: Aptos, Aptos_MSFontService, -apple-system, Robot=

o, Arial, Helvetica, sans-serif; font-size: 12pt; color: rgb(33, 33, 33);" =

dir="auto">

&nbsp; &nbsp; if (!activeProfile || !firebaseRefs) return null;</div>

<div style="font-family: Aptos, Aptos_MSFontService, -apple-system, Robot=

o, Arial, Helvetica, sans-serif; font-size: 12pt; color: rgb(33, 33, 33);" =

dir="auto">

&nbsp; &nbsp; const c = collection(firebaseRefs.db, 'artifacts', appId, '=

public', 'data', 'hubs', activeProfile.hubKey, col);</div>

<div style="font-family: Aptos, Aptos_MSFontService, -apple-system, Robot=

o, Arial, Helvetica, sans-serif; font-size: 12pt; color: rgb(33, 33, 33);" =

dir="auto">

&nbsp; &nbsp; return docId ? doc(c, docId) : c;</div>

<div style="font-family: Aptos, Aptos_MSFontService, -apple-system, Robot=

o, Arial, Helvetica, sans-serif; font-size: 12pt; color: rgb(33, 33, 33);" =

dir="auto">

&nbsp; };</div>

<div style="font-family: Aptos, Aptos_MSFontService, -apple-system, Robot=

o, Arial, Helvetica, sans-serif; font-size: 12pt; color: rgb(33, 33, 33);" =

dir="auto">

<br>

</div>

<div style="font-family: Aptos, Aptos_MSFontService, -apple-system, Robot=

o, Arial, Helvetica, sans-serif; font-size: 12pt; color: rgb(33, 33, 33);" =

dir="auto">

&nbsp; const handleQuickLogin = async () =&gt; {</div>

<div style="font-family: Aptos, Aptos_MSFontService, -apple-system, Robot=

o, Arial, Helvetica, sans-serif; font-size: 12pt; color: rgb(33, 33, 33);" =

dir="auto">

&nbsp; &nbsp; if (quickCode.length &lt; 4) return;</div>

<div style="font-family: Aptos, Aptos_MSFontService, -apple-system, Robot=

o, Arial, Helvetica, sans-serif; font-size: 12pt; color: rgb(33, 33, 33);" =

dir="auto">

&nbsp; &nbsp; try {</div>

<div style="font-family: Aptos, Aptos_MSFontService, -apple-system, Robot=

o, Arial, Helvetica, sans-serif; font-size: 12pt; color: rgb(33, 33, 33);" =

dir="auto">

&nbsp; &nbsp; &nbsp; const snap = await getDoc(doc(firebaseRefs.db, 'arti=

facts', appId, 'public', 'data', 'pins', quickCode));</div>

<div style="font-family: Aptos, Aptos_MSFontService, -apple-system, Robot=

o, Arial, Helvetica, sans-serif; font-size: 12pt; color: rgb(33, 33, 33);" =

dir="auto">

&nbsp; &nbsp; &nbsp; if (snap.exists()) {</div>

<div style="font-family: Aptos, Aptos_MSFontService, -apple-system, Robot=

o, Arial, Helvetica, sans-serif; font-size: 12pt; color: rgb(33, 33, 33);" =

dir="auto">

&nbsp; &nbsp; &nbsp; &nbsp; const d = snap.data();</div>

<div style="font-family: Aptos, Aptos_MSFontService, -apple-system, Robot=

o, Arial, Helvetica, sans-serif; font-size: 12pt; color: rgb(33, 33, 33);" =

dir="auto">

&nbsp; &nbsp; &nbsp; &nbsp; const p = { hubKey: d.hubKey, name: d.name, p=

hone: d.phone };</div>

<div style="font-family: Aptos, Aptos_MSFontService, -apple-system, Robot=

o, Arial, Helvetica, sans-serif; font-size: 12pt; color: rgb(33, 33, 33);" =

dir="auto">

&nbsp; &nbsp; &nbsp; &nbsp; localStorage.setItem('family_app_profile', JSON=

.stringify(p));</div>

<div style="font-family: Aptos, Aptos_MSFontService, -apple-system, Robot=

o, Arial, Helvetica, sans-serif; font-size: 12pt; color: rgb(33, 33, 33);" =

dir="auto">

&nbsp; &nbsp; &nbsp; &nbsp; setActiveProfile(p);</div>

<div style="font-family: Aptos, Aptos_MSFontService, -apple-system, Robot=

o, Arial, Helvetica, sans-serif; font-size: 12pt; color: rgb(33, 33, 33);" =

dir="auto">

&nbsp; &nbsp; &nbsp; } else { setLoginError(&quot;Invalid PIN&quot;); }</di=

v>

<div style="font-family: Aptos, Aptos_MSFontService, -apple-system, Robot=

o, Arial, Helvetica, sans-serif; font-size: 12pt; color: rgb(33, 33, 33);" =

dir="auto">

&nbsp; &nbsp; } catch (e) { setLoginError(&quot;Login Error&quot;); }</div>

<div style="font-family: Aptos, Aptos_MSFontService, -apple-system, Robot=

o, Arial, Helvetica, sans-serif; font-size: 12pt; color: rgb(33, 33, 33);" =

dir="auto">

&nbsp; };</div>

<div style="font-family: Aptos, Aptos_MSFontService, -apple-system, Robot=

o, Arial, Helvetica, sans-serif; font-size: 12pt; color: rgb(33, 33, 33);" =

dir="auto">

<br>

</div>

<div style="font-family: Aptos, Aptos_MSFontService, -apple-system, Robot=

o, Arial, Helvetica, sans-serif; font-size: 12pt; color: rgb(33, 33, 33);" =

dir="auto">

&nbsp; const handleFullLogin = () =&gt; {</div>

<div style="font-family: Aptos, Aptos_MSFontService, -apple-system, Robot=

o, Arial, Helvetica, sans-serif; font-size: 12pt; color: rgb(33, 33, 33);" =

dir="auto">

&nbsp; &nbsp; const p = inputPhone.replace(/\D/g, '');</div>

<div style="font-family: Aptos, Aptos_MSFontService, -apple-system, Robot=

o, Arial, Helvetica, sans-serif; font-size: 12pt; color: rgb(33, 33, 33);" =

dir="auto">

&nbsp; &nbsp; const n = inputProfileName.trim();</div>

<div style="font-family: Aptos, Aptos_MSFontService, -apple-system, Robot=

o, Arial, Helvetica, sans-serif; font-size: 12pt; color: rgb(33, 33, 33);" =

dir="auto">

&nbsp; &nbsp; if (p.length &lt; 5 || !n) return;</div>

<div style="font-family: Aptos, Aptos_MSFontService, -apple-system, Robot=

o, Arial, Helvetica, sans-serif; font-size: 12pt; color: rgb(33, 33, 33);" =

dir="auto">

&nbsp; &nbsp; const prof = { hubKey: `${p}_${n.toLowerCase()}`, name: n, =

phone: p };</div>

<div style="font-family: Aptos, Aptos_MSFontService, -apple-system, Robot=

o, Arial, Helvetica, sans-serif; font-size: 12pt; color: rgb(33, 33, 33);" =

dir="auto">

&nbsp; &nbsp; localStorage.setItem('family_app_profile', JSON.stringify(pro=

f));</div>

<div style="font-family: Aptos, Aptos_MSFontService, -apple-system, Robot=

o, Arial, Helvetica, sans-serif; font-size: 12pt; color: rgb(33, 33, 33);" =

dir="auto">

&nbsp; &nbsp; setActiveProfile(prof);</div>

<div style="font-family: Aptos, Aptos_MSFontService, -apple-system, Robot=

o, Arial, Helvetica, sans-serif; font-size: 12pt; color: rgb(33, 33, 33);" =

dir="auto">

&nbsp; };</div>

<div style="font-family: Aptos, Aptos_MSFontService, -apple-system, Robot=

o, Arial, Helvetica, sans-serif; font-size: 12pt; color: rgb(33, 33, 33);" =

dir="auto">

<br>

</div>

<div style="font-family: Aptos, Aptos_MSFontService, -apple-system, Robot=

o, Arial, Helvetica, sans-serif; font-size: 12pt; color: rgb(33, 33, 33);" =

dir="auto">

&nbsp; const updateDayNote = async (val) =&gt; {</div>

<div style="font-family: Aptos, Aptos_MSFontService, -apple-system, Robot=

o, Arial, Helvetica, sans-serif; font-size: 12pt; color: rgb(33, 33, 33);" =

dir="auto">

&nbsp; &nbsp; const id = `${selectedDate}_planner`;</div>

<div style="font-family: Aptos, Aptos_MSFontService, -apple-system, Robot=

o, Arial, Helvetica, sans-serif; font-size: 12pt; color: rgb(33, 33, 33);" =

dir="auto">

&nbsp; &nbsp; await setDoc(getHubRef('meals', id), {</div>

<div style="font-family: Aptos, Aptos_MSFontService, -apple-system, Robot=

o, Arial, Helvetica, sans-serif; font-size: 12pt; color: rgb(33, 33, 33);" =

dir="auto">

&nbsp; &nbsp; &nbsp; date: selectedDate, type: 'PLANNER_NOTE', note: val, l=

astUpdated: Date.now()</div>

<div style="font-family: Aptos, Aptos_MSFontService, -apple-system, Robot=

o, Arial, Helvetica, sans-serif; font-size: 12pt; color: rgb(33, 33, 33);" =

dir="auto">

&nbsp; &nbsp; }, { merge: true });</div>

<div style="font-family: Aptos, Aptos_MSFontService, -apple-system, Robot=

o, Arial, Helvetica, sans-serif; font-size: 12pt; color: rgb(33, 33, 33);" =

dir="auto">

&nbsp; };</div>

<div style="font-family: Aptos, Aptos_MSFontService, -apple-system, Robot=

o, Arial, Helvetica, sans-serif; font-size: 12pt; color: rgb(33, 33, 33);" =

dir="auto">

<br>

</div>

<div style="font-family: Aptos, Aptos_MSFontService, -apple-system, Robot=

o, Arial, Helvetica, sans-serif; font-size: 12pt; color: rgb(33, 33, 33);" =

dir="auto">

&nbsp; const addDishToMeal = async (type, name) =&gt; {</div>

<div style="font-family: Aptos, Aptos_MSFontService, -apple-system, Robot=

o, Arial, Helvetica, sans-serif; font-size: 12pt; color: rgb(33, 33, 33);" =

dir="auto">

&nbsp; &nbsp; if (!name || !name.trim()) return;</div>

<div style="font-family: Aptos, Aptos_MSFontService, -apple-system, Robot=

o, Arial, Helvetica, sans-serif; font-size: 12pt; color: rgb(33, 33, 33);" =

dir="auto">

&nbsp; &nbsp; const id = `${selectedDate}_${type}`;</div>

<div style="font-family: Aptos, Aptos_MSFontService, -apple-system, Robot=

o, Arial, Helvetica, sans-serif; font-size: 12pt; color: rgb(33, 33, 33);" =

dir="auto">

&nbsp; &nbsp; const m = (meals || []).find(x =&gt; x.id === id);<=

/div>

<div style="font-family: Aptos, Aptos_MSFontService, -apple-system, Robot=

o, Arial, Helvetica, sans-serif; font-size: 12pt; color: rgb(33, 33, 33);" =

dir="auto">

&nbsp; &nbsp; const existing = Array.isArray(m?.dishes) ? m.dishes : [];<=

/div>

<div style="font-family: Aptos, Aptos_MSFontService, -apple-system, Robot=

o, Arial, Helvetica, sans-serif; font-size: 12pt; color: rgb(33, 33, 33);" =

dir="auto">

&nbsp; &nbsp; if (existing.includes(name)) return;</div>

<div style="font-family: Aptos, Aptos_MSFontService, -apple-system, Robot=

o, Arial, Helvetica, sans-serif; font-size: 12pt; color: rgb(33, 33, 33);" =

dir="auto">

&nbsp; &nbsp; await setDoc(getHubRef('meals', id), {</div>

<div style="font-family: Aptos, Aptos_MSFontService, -apple-system, Robot=

o, Arial, Helvetica, sans-serif; font-size: 12pt; color: rgb(33, 33, 33);" =

dir="auto">

&nbsp; &nbsp; &nbsp; date: selectedDate, type, dishes: [...existing, name],=

 lastUpdated: Date.now()</div>

<div style="font-family: Aptos, Aptos_MSFontService, -apple-system, Robot=

o, Arial, Helvetica, sans-serif; font-size: 12pt; color: rgb(33, 33, 33);" =

dir="auto">

&nbsp; &nbsp; }, { merge: true });</div>

<div style="font-family: Aptos, Aptos_MSFontService, -apple-system, Robot=

o, Arial, Helvetica, sans-serif; font-size: 12pt; color: rgb(33, 33, 33);" =

dir="auto">

&nbsp; &nbsp; setManualInputs(prev =&gt; ({ ...prev, [type]: '' }));</div=

>

<div style="font-family: Aptos, Aptos_MSFontService, -apple-system, Robot=

o, Arial, Helvetica, sans-serif; font-size: 12pt; color: rgb(33, 33, 33);" =

dir="auto">

&nbsp; &nbsp; setIsLibraryOpen(false);</div>

<div style="font-family: Aptos, Aptos_MSFontService, -apple-system, Robot=

o, Arial, Helvetica, sans-serif; font-size: 12pt; color: rgb(33, 33, 33);" =

dir="auto">

&nbsp; };</div>

<div style="font-family: Aptos, Aptos_MSFontService, -apple-system, Robot=

o, Arial, Helvetica, sans-serif; font-size: 12pt; color: rgb(33, 33, 33);" =

dir="auto">

<br>

</div>

<div style="font-family: Aptos, Aptos_MSFontService, -apple-system, Robot=

o, Arial, Helvetica, sans-serif; font-size: 12pt; color: rgb(33, 33, 33);" =

dir="auto">

&nbsp; const removeDish = async (type, idx) =&gt; {</div>

<div style="font-family: Aptos, Aptos_MSFontService, -apple-system, Robot=

o, Arial, Helvetica, sans-serif; font-size: 12pt; color: rgb(33, 33, 33);" =

dir="auto">

&nbsp; &nbsp; const id = `${selectedDate}_${type}`;</div>

<div style="font-family: Aptos, Aptos_MSFontService, -apple-system, Robot=

o, Arial, Helvetica, sans-serif; font-size: 12pt; color: rgb(33, 33, 33);" =

dir="auto">

&nbsp; &nbsp; const m = (meals || []).find(x =&gt; x.id === id);<=

/div>

<div style="font-family: Aptos, Aptos_MSFontService, -apple-system, Robot=

o, Arial, Helvetica, sans-serif; font-size: 12pt; color: rgb(33, 33, 33);" =

dir="auto">

&nbsp; &nbsp; if (!m) return;</div>

<div style="font-family: Aptos, Aptos_MSFontService, -apple-system, Robot=

o, Arial, Helvetica, sans-serif; font-size: 12pt; color: rgb(33, 33, 33);" =

dir="auto">

&nbsp; &nbsp; const updated = [...m.dishes];</div>

<div style="font-family: Aptos, Aptos_MSFontService, -apple-system, Robot=

o, Arial, Helvetica, sans-serif; font-size: 12pt; color: rgb(33, 33, 33);" =

dir="auto">

&nbsp; &nbsp; updated.splice(idx, 1);</div>

<div style="font-family: Aptos, Aptos_MSFontService, -apple-system, Robot=

o, Arial, Helvetica, sans-serif; font-size: 12pt; color: rgb(33, 33, 33);" =

dir="auto">

&nbsp; &nbsp; await updateDoc(getHubRef('meals', id), { dishes: updated, la=

stUpdated: Date.now() });</div>

<div style="font-family: Aptos, Aptos_MSFontService, -apple-system, Robot=

o, Arial, Helvetica, sans-serif; font-size: 12pt; color: rgb(33, 33, 33);" =

dir="auto">

&nbsp; };</div>

<div style="font-family: Aptos, Aptos_MSFontService, -apple-system, Robot=

o, Arial, Helvetica, sans-serif; font-size: 12pt; color: rgb(33, 33, 33);" =

dir="auto">

<br>

</div>

<div style="font-family: Aptos, Aptos_MSFontService, -apple-system, Robot=

o, Arial, Helvetica, sans-serif; font-size: 12pt; color: rgb(33, 33, 33);" =

dir="auto">

&nbsp; const saveMealNote = async (type) =&gt; {</div>

<div style="font-family: Aptos, Aptos_MSFontService, -apple-system, Robot=

o, Arial, Helvetica, sans-serif; font-size: 12pt; color: rgb(33, 33, 33);" =

dir="auto">

&nbsp; &nbsp; if (!editingRemark) return;</div>

<div style="font-family: Aptos, Aptos_MSFontService, -apple-system, Robot=

o, Arial, Helvetica, sans-serif; font-size: 12pt; color: rgb(33, 33, 33);" =

dir="auto">

&nbsp; &nbsp; const id = `${selectedDate}_${type}`;</div>

<div style="font-family: Aptos, Aptos_MSFontService, -apple-system, Robot=

o, Arial, Helvetica, sans-serif; font-size: 12pt; color: rgb(33, 33, 33);" =

dir="auto">

&nbsp; &nbsp; await setDoc(getHubRef('meals', id), { remark: editingRemark.=

value, lastUpdated: Date.now() }, { merge: true });</div>

<div style="font-family: Aptos, Aptos_MSFontService, -apple-system, Robot=

o, Arial, Helvetica, sans-serif; font-size: 12pt; color: rgb(33, 33, 33);" =

dir="auto">

&nbsp; &nbsp; setEditingRemark(null);</div>

<div style="font-family: Aptos, Aptos_MSFontService, -apple-system, Robot=

o, Arial, Helvetica, sans-serif; font-size: 12pt; color: rgb(33, 33, 33);" =

dir="auto">

&nbsp; };</div>

<div style="font-family: Aptos, Aptos_MSFontService, -apple-system, Robot=

o, Arial, Helvetica, sans-serif; font-size: 12pt; color: rgb(33, 33, 33);" =

dir="auto">

<br>

</div>

<div style="font-family: Aptos, Aptos_MSFontService, -apple-system, Robot=

o, Arial, Helvetica, sans-serif; font-size: 12pt; color: rgb(33, 33, 33);" =

dir="auto">

&nbsp; const handleAddGrocery = async () =&gt; {</div>

<div style="font-family: Aptos, Aptos_MSFontService, -apple-system, Robot=

o, Arial, Helvetica, sans-serif; font-size: 12pt; color: rgb(33, 33, 33);" =

dir="auto">

&nbsp; &nbsp; const val = newGrocery.trim();</div>

<div style="font-family: Aptos, Aptos_MSFontService, -apple-system, Robot=

o, Arial, Helvetica, sans-serif; font-size: 12pt; color: rgb(33, 33, 33);" =

dir="auto">

&nbsp; &nbsp; if (!val) return;</div>

<div style="font-family: Aptos, Aptos_MSFontService, -apple-system, Robot=

o, Arial, Helvetica, sans-serif; font-size: 12pt; color: rgb(33, 33, 33);" =

dir="auto">

&nbsp; &nbsp; await addDoc(getHubRef('groceries'), { text: val, completed: =

false, createdAt: Date.now() });</div>

<div style="font-family: Aptos, Aptos_MSFontService, -apple-system, Robot=

o, Arial, Helvetica, sans-serif; font-size: 12pt; color: rgb(33, 33, 33);" =

dir="auto">

&nbsp; &nbsp; setNewGrocery('');</div>

<div style="font-family: Aptos, Aptos_MSFontService, -apple-system, Robot=

o, Arial, Helvetica, sans-serif; font-size: 12pt; color: rgb(33, 33, 33);" =

dir="auto">

&nbsp; };</div>

<div style="font-family: Aptos, Aptos_MSFontService, -apple-system, Robot=

o, Arial, Helvetica, sans-serif; font-size: 12pt; color: rgb(33, 33, 33);" =

dir="auto">

<br>

</div>

<div style="font-family: Aptos, Aptos_MSFontService, -apple-system, Robot=

o, Arial, Helvetica, sans-serif; font-size: 12pt; color: rgb(33, 33, 33);" =

dir="auto">

&nbsp; const handleCreateCategory = async () =&gt; {</div>

<div style="font-family: Aptos, Aptos_MSFontService, -apple-system, Robot=

o, Arial, Helvetica, sans-serif; font-size: 12pt; color: rgb(33, 33, 33);" =

dir="auto">

&nbsp; &nbsp; const val = newCategoryName.trim();</div>

<div style="font-family: Aptos, Aptos_MSFontService, -apple-system, Robot=

o, Arial, Helvetica, sans-serif; font-size: 12pt; color: rgb(33, 33, 33);" =

dir="auto">

&nbsp; &nbsp; if (!val) return;</div>

<div style="font-family: Aptos, Aptos_MSFontService, -apple-system, Robot=

o, Arial, Helvetica, sans-serif; font-size: 12pt; color: rgb(33, 33, 33);" =

dir="auto">

&nbsp; &nbsp; await addDoc(getHubRef('categories'), { name: val, createdAt:=

 Date.now() });</div>

<div style="font-family: Aptos, Aptos_MSFontService, -apple-system, Robot=

o, Arial, Helvetica, sans-serif; font-size: 12pt; color: rgb(33, 33, 33);" =

dir="auto">

&nbsp; &nbsp; setNewCategoryName('');</div>

<div style="font-family: Aptos, Aptos_MSFontService, -apple-system, Robot=

o, Arial, Helvetica, sans-serif; font-size: 12pt; color: rgb(33, 33, 33);" =

dir="auto">

&nbsp; };</div>

<div style="font-family: Aptos, Aptos_MSFontService, -apple-system, Robot=

o, Arial, Helvetica, sans-serif; font-size: 12pt; color: rgb(33, 33, 33);" =

dir="auto">

<br>

</div>

<div style="font-family: Aptos, Aptos_MSFontService, -apple-system, Robot=

o, Arial, Helvetica, sans-serif; font-size: 12pt; color: rgb(33, 33, 33);" =

dir="auto">

&nbsp; const handleAddDishToLib = async () =&gt; {</div>

<div style="font-family: Aptos, Aptos_MSFontService, -apple-system, Robot=

o, Arial, Helvetica, sans-serif; font-size: 12pt; color: rgb(33, 33, 33);" =

dir="auto">

&nbsp; &nbsp; const val = newDishName.trim();</div>

<div style="font-family: Aptos, Aptos_MSFontService, -apple-system, Robot=

o, Arial, Helvetica, sans-serif; font-size: 12pt; color: rgb(33, 33, 33);" =

dir="auto">

&nbsp; &nbsp; if (!val || !currentCategoryId) return;</div>

<div style="font-family: Aptos, Aptos_MSFontService, -apple-system, Robot=

o, Arial, Helvetica, sans-serif; font-size: 12pt; color: rgb(33, 33, 33);" =

dir="auto">

&nbsp; &nbsp; await addDoc(getHubRef('dishes'), { name: val, categoryId: cu=

rrentCategoryId, createdAt: Date.now() });</div>

<div style="font-family: Aptos, Aptos_MSFontService, -apple-system, Robot=

o, Arial, Helvetica, sans-serif; font-size: 12pt; color: rgb(33, 33, 33);" =

dir="auto">

&nbsp; &nbsp; setNewDishName('');</div>

<div style="font-family: Aptos, Aptos_MSFontService, -apple-system, Robot=

o, Arial, Helvetica, sans-serif; font-size: 12pt; color: rgb(33, 33, 33);" =

dir="auto">

&nbsp; };</div>

<div style="font-family: Aptos, Aptos_MSFontService, -apple-system, Robot=

o, Arial, Helvetica, sans-serif; font-size: 12pt; color: rgb(33, 33, 33);" =

dir="auto">

<br>

</div>

<div style="font-family: Aptos, Aptos_MSFontService, -apple-system, Robot=

o, Arial, Helvetica, sans-serif; font-size: 12pt; color: rgb(33, 33, 33);" =

dir="auto">

&nbsp; const handleExcelUpload = (e) =&gt; {</div>

<div style="font-family: Aptos, Aptos_MSFontService, -apple-system, Robot=

o, Arial, Helvetica, sans-serif; font-size: 12pt; color: rgb(33, 33, 33);" =

dir="auto">

&nbsp; &nbsp; const file = e.target.files[0];</div>

<div style="font-family: Aptos, Aptos_MSFontService, -apple-system, Robot=

o, Arial, Helvetica, sans-serif; font-size: 12pt; color: rgb(33, 33, 33);" =

dir="auto">

&nbsp; &nbsp; if (!file || !currentCategoryId || !window.XLSX) return;</div=

>

<div style="font-family: Aptos, Aptos_MSFontService, -apple-system, Robot=

o, Arial, Helvetica, sans-serif; font-size: 12pt; color: rgb(33, 33, 33);" =

dir="auto">

&nbsp; &nbsp; setIsImporting(true);</div>

<div style="font-family: Aptos, Aptos_MSFontService, -apple-system, Robot=

o, Arial, Helvetica, sans-serif; font-size: 12pt; color: rgb(33, 33, 33);" =

dir="auto">

&nbsp; &nbsp; const reader = new FileReader();</div>

<div style="font-family: Aptos, Aptos_MSFontService, -apple-system, Robot=

o, Arial, Helvetica, sans-serif; font-size: 12pt; color: rgb(33, 33, 33);" =

dir="auto">

&nbsp; &nbsp; reader.onload = async (evt) =&gt; {</div>

<div style="font-family: Aptos, Aptos_MSFontService, -apple-system, Robot=

o, Arial, Helvetica, sans-serif; font-size: 12pt; color: rgb(33, 33, 33);" =

dir="auto">

&nbsp; &nbsp; &nbsp; try {</div>

<div style="font-family: Aptos, Aptos_MSFontService, -apple-system, Robot=

o, Arial, Helvetica, sans-serif; font-size: 12pt; color: rgb(33, 33, 33);" =

dir="auto">

&nbsp; &nbsp; &nbsp; &nbsp; const bstr = evt.target.result;</div>

<div style="font-family: Aptos, Aptos_MSFontService, -apple-system, Robot=

o, Arial, Helvetica, sans-serif; font-size: 12pt; color: rgb(33, 33, 33);" =

dir="auto">

&nbsp; &nbsp; &nbsp; &nbsp; const wb = window.XLSX.read(bstr, { type: 'bi=

nary' });</div>

<div style="font-family: Aptos, Aptos_MSFontService, -apple-system, Robot=

o, Arial, Helvetica, sans-serif; font-size: 12pt; color: rgb(33, 33, 33);" =

dir="auto">

&nbsp; &nbsp; &nbsp; &nbsp; const ws = wb.Sheets[wb.SheetNames[0]];</div>

<div style="font-family: Aptos, Aptos_MSFontService, -apple-system, Robot=

o, Arial, Helvetica, sans-serif; font-size: 12pt; color: rgb(33, 33, 33);" =

dir="auto">

&nbsp; &nbsp; &nbsp; &nbsp; const data = window.XLSX.utils.sheet_to_json(=

ws);</div>

<div style="font-family: Aptos, Aptos_MSFontService, -apple-system, Robot=

o, Arial, Helvetica, sans-serif; font-size: 12pt; color: rgb(33, 33, 33);" =

dir="auto">

&nbsp; &nbsp; &nbsp; &nbsp; const batch = writeBatch(firebaseRefs.db);</d=

iv>

<div style="font-family: Aptos, Aptos_MSFontService, -apple-system, Robot=

o, Arial, Helvetica, sans-serif; font-size: 12pt; color: rgb(33, 33, 33);" =

dir="auto">

&nbsp; &nbsp; &nbsp; &nbsp; data.forEach(row =&gt; {</div>

<div style="font-family: Aptos, Aptos_MSFontService, -apple-system, Robot=

o, Arial, Helvetica, sans-serif; font-size: 12pt; color: rgb(33, 33, 33);" =

dir="auto">

&nbsp; &nbsp; &nbsp; &nbsp; &nbsp; const val = Object.values(row)[0];</di=

v>

<div style="font-family: Aptos, Aptos_MSFontService, -apple-system, Robot=

o, Arial, Helvetica, sans-serif; font-size: 12pt; color: rgb(33, 33, 33);" =

dir="auto">

&nbsp; &nbsp; &nbsp; &nbsp; &nbsp; if (val) {</div>

<div style="font-family: Aptos, Aptos_MSFontService, -apple-system, Robot=

o, Arial, Helvetica, sans-serif; font-size: 12pt; color: rgb(33, 33, 33);" =

dir="auto">

&nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; const dRef = doc(getHubRef('dis=

hes'));</div>

<div style="font-family: Aptos, Aptos_MSFontService, -apple-system, Robot=

o, Arial, Helvetica, sans-serif; font-size: 12pt; color: rgb(33, 33, 33);" =

dir="auto">

&nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; batch.set(dRef, { name: String(va=

l).trim(), categoryId: currentCategoryId, createdAt: Date.now() });</div>

<div style="font-family: Aptos, Aptos_MSFontService, -apple-system, Robot=

o, Arial, Helvetica, sans-serif; font-size: 12pt; color: rgb(33, 33, 33);" =

dir="auto">

&nbsp; &nbsp; &nbsp; &nbsp; &nbsp; }</div>

<div style="font-family: Aptos, Aptos_MSFontService, -apple-system, Robot=

o, Arial, Helvetica, sans-serif; font-size: 12pt; color: rgb(33, 33, 33);" =

dir="auto">

&nbsp; &nbsp; &nbsp; &nbsp; });</div>

<div style="font-family: Aptos, Aptos_MSFontService, -apple-system, Robot=

o, Arial, Helvetica, sans-serif; font-size: 12pt; color: rgb(33, 33, 33);" =

dir="auto">

&nbsp; &nbsp; &nbsp; &nbsp; await batch.commit();</div>

<div style="font-family: Aptos, Aptos_MSFontService, -apple-system, Robot=

o, Arial, Helvetica, sans-serif; font-size: 12pt; color: rgb(33, 33, 33);" =

dir="auto">

&nbsp; &nbsp; &nbsp; } finally { setIsImporting(false); e.target.value = =

''; }</div>

<div style="font-family: Aptos, Aptos_MSFontService, -apple-system, Robot=

o, Arial, Helvetica, sans-serif; font-size: 12pt; color: rgb(33, 33, 33);" =

dir="auto">

&nbsp; &nbsp; };</div>

<div style="font-family: Aptos, Aptos_MSFontService, -apple-system, Robot=

o, Arial, Helvetica, sans-serif; font-size: 12pt; color: rgb(33, 33, 33);" =

dir="auto">

&nbsp; &nbsp; reader.readAsBinaryString(file);</div>

<div style="font-family: Aptos, Aptos_MSFontService, -apple-system, Robot=

o, Arial, Helvetica, sans-serif; font-size: 12pt; color: rgb(33, 33, 33);" =

dir="auto">

&nbsp; };</div>

<div style="font-family: Aptos, Aptos_MSFontService, -apple-system, Robot=

o, Arial, Helvetica, sans-serif; font-size: 12pt; color: rgb(33, 33, 33);" =

dir="auto">

<br>

</div>

<div style="font-family: Aptos, Aptos_MSFontService, -apple-system, Robot=

o, Arial, Helvetica, sans-serif; font-size: 12pt; color: rgb(33, 33, 33);" =

dir="auto">

&nbsp; if (!isConfigReady) return &lt;div className=&quot;h-screen flex i=

tems-center justify-center bg-slate-50&quot;&gt;&lt;RefreshCw className=&=

quot;animate-spin text-indigo-600&quot; /&gt;&lt;/div&gt;;</div>

<div style="font-family: Aptos, Aptos_MSFontService, -apple-system, Robot=

o, Arial, Helvetica, sans-serif; font-size: 12pt; color: rgb(33, 33, 33);" =

dir="auto">

<br>

</div>

<div style="font-family: Aptos, Aptos_MSFontService, -apple-system, Robot=

o, Arial, Helvetica, sans-serif; font-size: 12pt; color: rgb(33, 33, 33);" =

dir="auto">

&nbsp; if (!activeProfile) {</div>

<div style="font-family: Aptos, Aptos_MSFontService, -apple-system, Robot=

o, Arial, Helvetica, sans-serif; font-size: 12pt; color: rgb(33, 33, 33);" =

dir="auto">

&nbsp; &nbsp; return (</div>

<div style="font-family: Aptos, Aptos_MSFontService, -apple-system, Robot=

o, Arial, Helvetica, sans-serif; font-size: 12pt; color: rgb(33, 33, 33);" =

dir="auto">

&nbsp; &nbsp; &nbsp; &lt;div className=&quot;min-h-screen bg-slate-50 fle=

x items-center justify-center p-6&quot;&gt;</div>

<div style="font-family: Aptos, Aptos_MSFontService, -apple-system, Robot=

o, Arial, Helvetica, sans-serif; font-size: 12pt; color: rgb(33, 33, 33);" =

dir="auto">

&nbsp; &nbsp; &nbsp; &nbsp; &lt;div className=&quot;max-w-md w-full bg-wh=

ite rounded-[2.5rem] shadow-2xl p-8 border border-slate-100&quot;&gt;</div>

<div style="font-family: Aptos, Aptos_MSFontService, -apple-system, Robot=

o, Arial, Helvetica, sans-serif; font-size: 12pt; color: rgb(33, 33, 33);" =

dir="auto">

&nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &lt;div className=&quot;flex justify-c=

enter mb-6&quot;&gt;&lt;div className=&quot;p-4 bg-indigo-50 rounded-2xl =

text-indigo-600&quot;&gt;{isQuickLoginMode ? &lt;KeyRound size={40}/&gt; =

: &lt;ShieldCheck size={40}/&gt;}&lt;/div&gt;&lt;/div&gt;</div>

<div style="font-family: Aptos, Aptos_MSFontService, -apple-system, Robot=

o, Arial, Helvetica, sans-serif; font-size: 12pt; color: rgb(33, 33, 33);" =

dir="auto">

&nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &lt;h2 className=&quot;text-2xl font-b=

lack text-center mb-8 text-slate-900 uppercase tracking-widest leading-tigh=

t&quot;&gt;Family Planner&lt;/h2&gt;</div>

<div style="font-family: Aptos, Aptos_MSFontService, -apple-system, Robot=

o, Arial, Helvetica, sans-serif; font-size: 12pt; color: rgb(33, 33, 33);" =

dir="auto">

&nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &lt;div className=&quot;space-y-4&quot=

;&gt;</div>

<div style="font-family: Aptos, Aptos_MSFontService, -apple-system, Robot=

o, Arial, Helvetica, sans-serif; font-size: 12pt; color: rgb(33, 33, 33);" =

dir="auto">

&nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; {isQuickLoginMode ? (</div>

<div style="font-family: Aptos, Aptos_MSFontService, -apple-system, Robot=

o, Arial, Helvetica, sans-serif; font-size: 12pt; color: rgb(33, 33, 33);" =

dir="auto">

&nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &lt;div className=&quot;=

space-y-4&quot;&gt;</div>

<div style="font-family: Aptos, Aptos_MSFontService, -apple-system, Robot=

o, Arial, Helvetica, sans-serif; font-size: 12pt; color: rgb(33, 33, 33);" =

dir="auto">

&nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &lt;input type=&q=

uot;password&quot; inputMode=&quot;numeric&quot; placeholder=&quot;=95=

=95=95=95&quot; className=&quot;w-full px-5 py-5 rounded-2xl bg-slate-50 =

border border-slate-100 outline-none text-center text-3xl font-black tracki=

ng-[0.5em]&quot; maxLength={6} value={quickCode} onChange={(e)

 =&gt; setQuickCode(e.target.value)} /&gt;</div>

<div style="font-family: Aptos, Aptos_MSFontService, -apple-system, Robot=

o, Arial, Helvetica, sans-serif; font-size: 12pt; color: rgb(33, 33, 33);" =

dir="auto">

&nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &lt;button onClick=

={handleQuickLogin} className=&quot;w-full bg-indigo-600 text-white fon=

t-black py-5 rounded-2xl shadow-xl hover:bg-indigo-700 active:scale-95 tran=

sition-all&quot;&gt;ENTER HUB&lt;/button&gt;</div>

<div style="font-family: Aptos, Aptos_MSFontService, -apple-system, Robot=

o, Arial, Helvetica, sans-serif; font-size: 12pt; color: rgb(33, 33, 33);" =

dir="auto">

&nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &lt;/div&gt;</div>

<div style="font-family: Aptos, Aptos_MSFontService, -apple-system, Robot=

o, Arial, Helvetica, sans-serif; font-size: 12pt; color: rgb(33, 33, 33);" =

dir="auto">

&nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; ) : (</div>

<div style="font-family: Aptos, Aptos_MSFontService, -apple-system, Robot=

o, Arial, Helvetica, sans-serif; font-size: 12pt; color: rgb(33, 33, 33);" =

dir="auto">

&nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &lt;div className=&quot;=

space-y-4&quot;&gt;</div>

<div style="font-family: Aptos, Aptos_MSFontService, -apple-system, Robot=

o, Arial, Helvetica, sans-serif; font-size: 12pt; color: rgb(33, 33, 33);" =

dir="auto">

&nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &lt;input type=&q=

uot;tel&quot; placeholder=&quot;Phone Number&quot; className=&quot;w-fu=

ll px-6 py-4 rounded-2xl bg-slate-50 border border-slate-100 font-bold&quot=

; value={inputPhone} onChange={(e) =&gt; setInputPhone(e.target.value=

)} /&gt;</div>

<div style="font-family: Aptos, Aptos_MSFontService, -apple-system, Robot=

o, Arial, Helvetica, sans-serif; font-size: 12pt; color: rgb(33, 33, 33);" =

dir="auto">

&nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &lt;input type=&q=

uot;text&quot; placeholder=&quot;Family Name&quot; className=&quot;w-fu=

ll px-6 py-4 rounded-2xl bg-slate-50 border border-slate-100 font-bold&quot=

; value={inputProfileName} onChange={(e) =&gt; setInputProfileName(e.=

target.value)} /&gt;</div>

<div style="font-family: Aptos, Aptos_MSFontService, -apple-system, Robot=

o, Arial, Helvetica, sans-serif; font-size: 12pt; color: rgb(33, 33, 33);" =

dir="auto">

&nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &lt;button onClick=

={handleFullLogin} className=&quot;w-full bg-indigo-600 text-white font=

-black py-5 rounded-2xl shadow-xl hover:bg-indigo-700 active:scale-95 trans=

ition-all&quot;&gt;LOGIN&lt;/button&gt;</div>

<div style="font-family: Aptos, Aptos_MSFontService, -apple-system, Robot=

o, Arial, Helvetica, sans-serif; font-size: 12pt; color: rgb(33, 33, 33);" =

dir="auto">

&nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &lt;/div&gt;</div>

<div style="font-family: Aptos, Aptos_MSFontService, -apple-system, Robot=

o, Arial, Helvetica, sans-serif; font-size: 12pt; color: rgb(33, 33, 33);" =

dir="auto">

&nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; )}</div>

<div style="font-family: Aptos, Aptos_MSFontService, -apple-system, Robot=

o, Arial, Helvetica, sans-serif; font-size: 12pt; color: rgb(33, 33, 33);" =

dir="auto">

&nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; {loginError &amp;&amp; &lt;p clas=

sName=&quot;text-[10px] text-rose-500 font-black text-center uppercase&qu=

ot;&gt;{loginError}&lt;/p&gt;}</div>

<div style="font-family: Aptos, Aptos_MSFontService, -apple-system, Robot=

o, Arial, Helvetica, sans-serif; font-size: 12pt; color: rgb(33, 33, 33);" =

dir="auto">

&nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &lt;button onClick={() =&gt; =

setIsQuickLoginMode(!isQuickLoginMode)} className=&quot;w-full text-slate=

-400 font-black text-[10px] uppercase mt-4&quot;&gt;Change Login Method&lt;=

/button&gt;</div>

<div style="font-family: Aptos, Aptos_MSFontService, -apple-system, Robot=

o, Arial, Helvetica, sans-serif; font-size: 12pt; color: rgb(33, 33, 33);" =

dir="auto">

&nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &lt;/div&gt;</div>

<div style="font-family: Aptos, Aptos_MSFontService, -apple-system, Robot=

o, Arial, Helvetica, sans-serif; font-size: 12pt; color: rgb(33, 33, 33);" =

dir="auto">

&nbsp; &nbsp; &nbsp; &nbsp; &lt;/div&gt;</div>

<div style="font-family: Aptos, Aptos_MSFontService, -apple-system, Robot=

o, Arial, Helvetica, sans-serif; font-size: 12pt; color: rgb(33, 33, 33);" =

dir="auto">

&nbsp; &nbsp; &nbsp; &lt;/div&gt;</div>

<div style="font-family: Aptos, Aptos_MSFontService, -apple-system, Robot=

o, Arial, Helvetica, sans-serif; font-size: 12pt; color: rgb(33, 33, 33);" =

dir="auto">

&nbsp; &nbsp; );</div>

<div style="font-family: Aptos, Aptos_MSFontService, -apple-system, Robot=

o, Arial, Helvetica, sans-serif; font-size: 12pt; color: rgb(33, 33, 33);" =

dir="auto">

&nbsp; }</div>

<div style="font-family: Aptos, Aptos_MSFontService, -apple-system, Robot=

o, Arial, Helvetica, sans-serif; font-size: 12pt; color: rgb(33, 33, 33);" =

dir="auto">

<br>

</div>

<div style="font-family: Aptos, Aptos_MSFontService, -apple-system, Robot=

o, Arial, Helvetica, sans-serif; font-size: 12pt; color: rgb(33, 33, 33);" =

dir="auto">

&nbsp; const dailyNote = (meals || []).find(m =&gt; m.id === `${s=

electedDate}_planner`)?.note || '';</div>

<div style="font-family: Aptos, Aptos_MSFontService, -apple-system, Robot=

o, Arial, Helvetica, sans-serif; font-size: 12pt; color: rgb(33, 33, 33);" =

dir="auto">

<br>

</div>

<div style="font-family: Aptos, Aptos_MSFontService, -apple-system, Robot=

o, Arial, Helvetica, sans-serif; font-size: 12pt; color: rgb(33, 33, 33);" =

dir="auto">

&nbsp; return (</div>

<div style="font-family: Aptos, Aptos_MSFontService, -apple-system, Robot=

o, Arial, Helvetica, sans-serif; font-size: 12pt; color: rgb(33, 33, 33);" =

dir="auto">

&nbsp; &nbsp; &lt;div className=&quot;min-h-screen bg-slate-50 pb-32 font=

-sans select-none overflow-x-hidden&quot;&gt;</div>

<div style="font-family: Aptos, Aptos_MSFontService, -apple-system, Robot=

o, Arial, Helvetica, sans-serif; font-size: 12pt; color: rgb(33, 33, 33);" =

dir="auto">

&nbsp; &nbsp; &nbsp; &lt;header className=&quot;bg-white/80 backdrop-blur=

-md border-b sticky top-0 z-30 px-5 py-4&quot;&gt;</div>

<div style="font-family: Aptos, Aptos_MSFontService, -apple-system, Robot=

o, Arial, Helvetica, sans-serif; font-size: 12pt; color: rgb(33, 33, 33);" =

dir="auto">

&nbsp; &nbsp; &nbsp; &nbsp; &lt;div className=&quot;flex items-center jus=

tify-between mb-4&quot;&gt;</div>

<div style="font-family: Aptos, Aptos_MSFontService, -apple-system, Robot=

o, Arial, Helvetica, sans-serif; font-size: 12pt; color: rgb(33, 33, 33);" =

dir="auto">

&nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &lt;div className=&quot;flex items-cen=

ter gap-2&quot;&gt;</div>

<div style="font-family: Aptos, Aptos_MSFontService, -apple-system, Robot=

o, Arial, Helvetica, sans-serif; font-size: 12pt; color: rgb(33, 33, 33);" =

dir="auto">

&nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &lt;div className=&quot;bg-indi=

go-600 p-2 rounded-xl text-white shadow-md&quot;&gt;&lt;Home size={18}/&g=

t;&lt;/div&gt;</div>

<div style="font-family: Aptos, Aptos_MSFontService, -apple-system, Robot=

o, Arial, Helvetica, sans-serif; font-size: 12pt; color: rgb(33, 33, 33);" =

dir="auto">

&nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &lt;div&gt;</div>

<div style="font-family: Aptos, Aptos_MSFontService, -apple-system, Robot=

o, Arial, Helvetica, sans-serif; font-size: 12pt; color: rgb(33, 33, 33);" =

dir="auto">

&nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &lt;h1 className=&quot;t=

ext-sm font-black text-slate-900 uppercase leading-none&quot;&gt;{activePro=

file.name} Hub&lt;/h1&gt;</div>

<div style="font-family: Aptos, Aptos_MSFontService, -apple-system, Robot=

o, Arial, Helvetica, sans-serif; font-size: 12pt; color: rgb(33, 33, 33);" =

dir="auto">

&nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &lt;p className=&quot;te=

xt-[9px] font-bold text-slate-400 mt-1 uppercase tracking-widest&quot;&gt;{=

APP_VERSION}&lt;/p&gt;</div>

<div style="font-family: Aptos, Aptos_MSFontService, -apple-system, Robot=

o, Arial, Helvetica, sans-serif; font-size: 12pt; color: rgb(33, 33, 33);" =

dir="auto">

&nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &lt;/div&gt;</div>

<div style="font-family: Aptos, Aptos_MSFontService, -apple-system, Robot=

o, Arial, Helvetica, sans-serif; font-size: 12pt; color: rgb(33, 33, 33);" =

dir="auto">

&nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &lt;/div&gt;</div>

<div style="font-family: Aptos, Aptos_MSFontService, -apple-system, Robot=

o, Arial, Helvetica, sans-serif; font-size: 12pt; color: rgb(33, 33, 33);" =

dir="auto">

&nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &lt;button onClick={() =&gt; { setIs=

LibraryOpen(true); setCurrentCategoryId(null); }} className=&quot;bg-slat=

e-900 text-white px-4 py-2 rounded-full text-[10px] font-black flex items-c=

enter gap-1.5 shadow-md&quot;&gt;</div>

<div style="font-family: Aptos, Aptos_MSFontService, -apple-system, Robot=

o, Arial, Helvetica, sans-serif; font-size: 12pt; color: rgb(33, 33, 33);" =

dir="auto">

&nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &lt;LayoutGrid size={12}/&gt; L=

IBRARY</div>

<div style="font-family: Aptos, Aptos_MSFontService, -apple-system, Robot=

o, Arial, Helvetica, sans-serif; font-size: 12pt; color: rgb(33, 33, 33);" =

dir="auto">

&nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &lt;/button&gt;</div>

<div style="font-family: Aptos, Aptos_MSFontService, -apple-system, Robot=

o, Arial, Helvetica, sans-serif; font-size: 12pt; color: rgb(33, 33, 33);" =

dir="auto">

&nbsp; &nbsp; &nbsp; &nbsp; &lt;/div&gt;</div>

<div style="font-family: Aptos, Aptos_MSFontService, -apple-system, Robot=

o, Arial, Helvetica, sans-serif; font-size: 12pt; color: rgb(33, 33, 33);" =

dir="auto">

&nbsp; &nbsp; &nbsp; &nbsp; &lt;div className=&quot;flex items-center jus=

tify-between gap-2 bg-slate-100/50 p-1.5 rounded-2xl border border-slate-10=

0&quot;&gt;</div>

<div style="font-family: Aptos, Aptos_MSFontService, -apple-system, Robot=

o, Arial, Helvetica, sans-serif; font-size: 12pt; color: rgb(33, 33, 33);" =

dir="auto">

&nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &lt;button onClick={() =&gt; { const=

 d = new Date(selectedDate); d.setDate(d.getDate() - 1); setSelectedDate(=

d.toISOString().split('T')[0]); }} className=&quot;p-2 bg-white rounded-x=

l shadow-sm&quot;&gt;&lt;ChevronLeft size={16}/&gt;&lt;/button&gt;</div>

<div style="font-family: Aptos, Aptos_MSFontService, -apple-system, Robot=

o, Arial, Helvetica, sans-serif; font-size: 12pt; color: rgb(33, 33, 33);" =

dir="auto">

&nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &lt;p className=&quot;font-black text-=

slate-700 text-xs&quot;&gt;{new Date(selectedDate).toLocaleDateString('en-U=

S', { weekday: 'long', month: 'short', day: 'numeric' })}&lt;/p&gt;</div>

<div style="font-family: Aptos, Aptos_MSFontService, -apple-system, Robot=

o, Arial, Helvetica, sans-serif; font-size: 12pt; color: rgb(33, 33, 33);" =

dir="auto">

&nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &lt;button onClick={() =&gt; { const=

 d = new Date(selectedDate); d.setDate(d.getDate() + 1); setSelectedDate(=

d.toISOString().split('T')[0]); }} className=&quot;p-2 bg-white rounded-x=

l shadow-sm&quot;&gt;&lt;ChevronRight size={16}/&gt;&lt;/button&gt;</div>

<div style="font-family: Aptos, Aptos_MSFontService, -apple-system, Robot=

o, Arial, Helvetica, sans-serif; font-size: 12pt; color: rgb(33, 33, 33);" =

dir="auto">

&nbsp; &nbsp; &nbsp; &nbsp; &lt;/div&gt;</div>

<div style="font-family: Aptos, Aptos_MSFontService, -apple-system, Robot=

o, Arial, Helvetica, sans-serif; font-size: 12pt; color: rgb(33, 33, 33);" =

dir="auto">

&nbsp; &nbsp; &nbsp; &lt;/header&gt;</div>

<div style="font-family: Aptos, Aptos_MSFontService, -apple-system, Robot=

o, Arial, Helvetica, sans-serif; font-size: 12pt; color: rgb(33, 33, 33);" =

dir="auto">

<br>

</div>

<div style="font-family: Aptos, Aptos_MSFontService, -apple-system, Robot=

o, Arial, Helvetica, sans-serif; font-size: 12pt; color: rgb(33, 33, 33);" =

dir="auto">

&nbsp; &nbsp; &nbsp; &lt;main className=&quot;max-w-lg mx-auto p-4 space-=

y-6&quot;&gt;</div>

<div style="font-family: Aptos, Aptos_MSFontService, -apple-system, Robot=

o, Arial, Helvetica, sans-serif; font-size: 12pt; color: rgb(33, 33, 33);" =

dir="auto">

&nbsp; &nbsp; &nbsp; &nbsp; {activeTab === 'meals' &amp;&amp; (</div>

<div style="font-family: Aptos, Aptos_MSFontService, -apple-system, Robot=

o, Arial, Helvetica, sans-serif; font-size: 12pt; color: rgb(33, 33, 33);" =

dir="auto">

&nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &lt;div className=&quot;space-y-6&quot=

;&gt;</div>

<div style="font-family: Aptos, Aptos_MSFontService, -apple-system, Robot=

o, Arial, Helvetica, sans-serif; font-size: 12pt; color: rgb(33, 33, 33);" =

dir="auto">

&nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &lt;div className=&quot;bg-ambe=

r-50 rounded-[2rem] p-6 border border-amber-100 shadow-sm relative overflow=

-hidden&quot;&gt;</div>

<div style="font-family: Aptos, Aptos_MSFontService, -apple-system, Robot=

o, Arial, Helvetica, sans-serif; font-size: 12pt; color: rgb(33, 33, 33);" =

dir="auto">

&nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp;&lt;div className==

&quot;absolute top-0 right-0 p-4 opacity-10&quot;&gt;&lt;StickyNote size==

{60}/&gt;&lt;/div&gt;</div>

<div style="font-family: Aptos, Aptos_MSFontService, -apple-system, Robot=

o, Arial, Helvetica, sans-serif; font-size: 12pt; color: rgb(33, 33, 33);" =

dir="auto">

&nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp;&lt;div className==

&quot;flex items-center gap-2 mb-3&quot;&gt;</div>

<div style="font-family: Aptos, Aptos_MSFontService, -apple-system, Robot=

o, Arial, Helvetica, sans-serif; font-size: 12pt; color: rgb(33, 33, 33);" =

dir="auto">

&nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp;&lt;span clas=

sName=&quot;text-[10px] font-black text-amber-600 uppercase tracking-wide=

st&quot;&gt;Daily Planner Note&lt;/span&gt;</div>

<div style="font-family: Aptos, Aptos_MSFontService, -apple-system, Robot=

o, Arial, Helvetica, sans-serif; font-size: 12pt; color: rgb(33, 33, 33);" =

dir="auto">

&nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp;&lt;/div&gt;</div>

<div style="font-family: Aptos, Aptos_MSFontService, -apple-system, Robot=

o, Arial, Helvetica, sans-serif; font-size: 12pt; color: rgb(33, 33, 33);" =

dir="auto">

&nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp;&lt;textarea&nbsp;</=

div>

<div style="font-family: Aptos, Aptos_MSFontService, -apple-system, Robot=

o, Arial, Helvetica, sans-serif; font-size: 12pt; color: rgb(33, 33, 33);" =

dir="auto">

&nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp;className=&=

quot;w-full bg-transparent border-none outline-none font-bold text-sm text-=

amber-900 placeholder:text-amber-200 resize-none min-h-[60px]&quot;&nbsp;</=

div>

<div style="font-family: Aptos, Aptos_MSFontService, -apple-system, Robot=

o, Arial, Helvetica, sans-serif; font-size: 12pt; color: rgb(33, 33, 33);" =

dir="auto">

&nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp;placeholder=

=&quot;Agenda for today...&quot;</div>

<div style="font-family: Aptos, Aptos_MSFontService, -apple-system, Robot=

o, Arial, Helvetica, sans-serif; font-size: 12pt; color: rgb(33, 33, 33);" =

dir="auto">

&nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp;value={dail=

yNote}</div>

<div style="font-family: Aptos, Aptos_MSFontService, -apple-system, Robot=

o, Arial, Helvetica, sans-serif; font-size: 12pt; color: rgb(33, 33, 33);" =

dir="auto">

&nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp;onChange={(=

e) =&gt; updateDayNote(e.target.value)}</div>

<div style="font-family: Aptos, Aptos_MSFontService, -apple-system, Robot=

o, Arial, Helvetica, sans-serif; font-size: 12pt; color: rgb(33, 33, 33);" =

dir="auto">

&nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp;/&gt;</div>

<div style="font-family: Aptos, Aptos_MSFontService, -apple-system, Robot=

o, Arial, Helvetica, sans-serif; font-size: 12pt; color: rgb(33, 33, 33);" =

dir="auto">

&nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &lt;/div&gt;</div>

<div style="font-family: Aptos, Aptos_MSFontService, -apple-system, Robot=

o, Arial, Helvetica, sans-serif; font-size: 12pt; color: rgb(33, 33, 33);" =

dir="auto">

<br>

</div>

<div style="font-family: Aptos, Aptos_MSFontService, -apple-system, Robot=

o, Arial, Helvetica, sans-serif; font-size: 12pt; color: rgb(33, 33, 33);" =

dir="auto">

&nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &lt;div className=&quot;space-y=

-4&quot;&gt;</div>

<div style="font-family: Aptos, Aptos_MSFontService, -apple-system, Robot=

o, Arial, Helvetica, sans-serif; font-size: 12pt; color: rgb(33, 33, 33);" =

dir="auto">

&nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; {MEAL_TYPES.map(type =&g=

t; {</div>

<div style="font-family: Aptos, Aptos_MSFontService, -apple-system, Robot=

o, Arial, Helvetica, sans-serif; font-size: 12pt; color: rgb(33, 33, 33);" =

dir="auto">

&nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; const m = (meals =

|| []).find(x =&gt; x.id === `${selectedDate}_${type}`);</div>

<div style="font-family: Aptos, Aptos_MSFontService, -apple-system, Robot=

o, Arial, Helvetica, sans-serif; font-size: 12pt; color: rgb(33, 33, 33);" =

dir="auto">

&nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; const isEdit = ed=

itingRemark?.type === type;</div>

<div style="font-family: Aptos, Aptos_MSFontService, -apple-system, Robot=

o, Arial, Helvetica, sans-serif; font-size: 12pt; color: rgb(33, 33, 33);" =

dir="auto">

&nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; const dishList = =

Array.isArray(m?.dishes) ? m.dishes : [];</div>

<div style="font-family: Aptos, Aptos_MSFontService, -apple-system, Robot=

o, Arial, Helvetica, sans-serif; font-size: 12pt; color: rgb(33, 33, 33);" =

dir="auto">

&nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; return (</div>

<div style="font-family: Aptos, Aptos_MSFontService, -apple-system, Robot=

o, Arial, Helvetica, sans-serif; font-size: 12pt; color: rgb(33, 33, 33);" =

dir="auto">

&nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &lt;div key=

={type} className=&quot;bg-white rounded-[2rem] p-6 shadow-sm border bo=

rder-slate-100 relative overflow-hidden&quot;&gt;</div>

<div style="font-family: Aptos, Aptos_MSFontService, -apple-system, Robot=

o, Arial, Helvetica, sans-serif; font-size: 12pt; color: rgb(33, 33, 33);" =

dir="auto">

&nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &lt;d=

iv className=&quot;absolute left-0 top-0 bottom-0 w-1 bg-indigo-500&quot;=

 /&gt;</div>

<div style="font-family: Aptos, Aptos_MSFontService, -apple-system, Robot=

o, Arial, Helvetica, sans-serif; font-size: 12pt; color: rgb(33, 33, 33);" =

dir="auto">

&nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &lt;d=

iv className=&quot;flex justify-between items-center mb-4&quot;&gt;</div>

<div style="font-family: Aptos, Aptos_MSFontService, -apple-system, Robot=

o, Arial, Helvetica, sans-serif; font-size: 12pt; color: rgb(33, 33, 33);" =

dir="auto">

&nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp=

; &lt;span className=&quot;text-[10px] font-black text-slate-400 uppercas=

e tracking-widest&quot;&gt;{type}&lt;/span&gt;</div>

<div style="font-family: Aptos, Aptos_MSFontService, -apple-system, Robot=

o, Arial, Helvetica, sans-serif; font-size: 12pt; color: rgb(33, 33, 33);" =

dir="auto">

&nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp=

; &lt;div className=&quot;flex gap-2&quot;&gt;</div>

<div style="font-family: Aptos, Aptos_MSFontService, -apple-system, Robot=

o, Arial, Helvetica, sans-serif; font-size: 12pt; color: rgb(33, 33, 33);" =

dir="auto">

&nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp=

; &nbsp; &lt;button onClick={() =&gt; { setSelectingFor({ type }); setI=

sLibraryOpen(true); setCurrentCategoryId(null); }} className=&quot;p-2 bg=

-indigo-50 text-indigo-600 rounded-xl&quot;&gt;&lt;PlusCircle size={16}/&=

gt;&lt;/button&gt;</div>

<div style="font-family: Aptos, Aptos_MSFontService, -apple-system, Robot=

o, Arial, Helvetica, sans-serif; font-size: 12pt; color: rgb(33, 33, 33);" =

dir="auto">

&nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp=

; &nbsp; &lt;button onClick={() =&gt; addDishToMeal(type, SUGGESTED_MEA=

LS[type][Math.floor(Math.random() * SUGGESTED_MEALS[type].length)])} classN=

ame=&quot;p-2 bg-purple-50 text-purple-600 rounded-xl&quot;&gt;&lt;Sparkl=

es size={16}/&gt;&lt;/button&gt;</div>

<div style="font-family: Aptos, Aptos_MSFontService, -apple-system, Robot=

o, Arial, Helvetica, sans-serif; font-size: 12pt; color: rgb(33, 33, 33);" =

dir="auto">

&nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp=

; &lt;/div&gt;</div>

<div style="font-family: Aptos, Aptos_MSFontService, -apple-system, Robot=

o, Arial, Helvetica, sans-serif; font-size: 12pt; color: rgb(33, 33, 33);" =

dir="auto">

&nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &lt;/=

div&gt;</div>

<div style="font-family: Aptos, Aptos_MSFontService, -apple-system, Robot=

o, Arial, Helvetica, sans-serif; font-size: 12pt; color: rgb(33, 33, 33);" =

dir="auto">

&nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp;&nbsp;=

</div>

<div style="font-family: Aptos, Aptos_MSFontService, -apple-system, Robot=

o, Arial, Helvetica, sans-serif; font-size: 12pt; color: rgb(33, 33, 33);" =

dir="auto">

&nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &lt;d=

iv className=&quot;mb-4&quot;&gt;</div>

<div style="font-family: Aptos, Aptos_MSFontService, -apple-system, Robot=

o, Arial, Helvetica, sans-serif; font-size: 12pt; color: rgb(33, 33, 33);" =

dir="auto">

&nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp=

; &nbsp;&lt;div className=&quot;flex gap-2 mb-3&quot;&gt;</div>

<div style="font-family: Aptos, Aptos_MSFontService, -apple-system, Robot=

o, Arial, Helvetica, sans-serif; font-size: 12pt; color: rgb(33, 33, 33);" =

dir="auto">

&nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp=

; &nbsp; &nbsp;&lt;input&nbsp;</div>

<div style="font-family: Aptos, Aptos_MSFontService, -apple-system, Robot=

o, Arial, Helvetica, sans-serif; font-size: 12pt; color: rgb(33, 33, 33);" =

dir="auto">

&nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp=

; &nbsp; &nbsp; &nbsp;type=&quot;text&quot;&nbsp;</div>

<div style="font-family: Aptos, Aptos_MSFontService, -apple-system, Robot=

o, Arial, Helvetica, sans-serif; font-size: 12pt; color: rgb(33, 33, 33);" =

dir="auto">

&nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp=

; &nbsp; &nbsp; &nbsp;placeholder={`Add ${type} dish...`}</div>

<div style="font-family: Aptos, Aptos_MSFontService, -apple-system, Robot=

o, Arial, Helvetica, sans-serif; font-size: 12pt; color: rgb(33, 33, 33);" =

dir="auto">

&nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp=

; &nbsp; &nbsp; &nbsp;className=&quot;flex-1 bg-slate-50 border-none px-4=

 py-2 rounded-xl text-sm font-bold text-slate-700 outline-none focus:bg-ind=

igo-50 transition-colors&quot;</div>

<div style="font-family: Aptos, Aptos_MSFontService, -apple-system, Robot=

o, Arial, Helvetica, sans-serif; font-size: 12pt; color: rgb(33, 33, 33);" =

dir="auto">

&nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp=

; &nbsp; &nbsp; &nbsp;value={manualInputs[type] || ''}</div>

<div style="font-family: Aptos, Aptos_MSFontService, -apple-system, Robot=

o, Arial, Helvetica, sans-serif; font-size: 12pt; color: rgb(33, 33, 33);" =

dir="auto">

&nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp=

; &nbsp; &nbsp; &nbsp;onChange={(e) =&gt; setManualInputs(prev =&gt; =

({ ...prev, [type]: e.target.value }))}</div>

<div style="font-family: Aptos, Aptos_MSFontService, -apple-system, Robot=

o, Arial, Helvetica, sans-serif; font-size: 12pt; color: rgb(33, 33, 33);" =

dir="auto">

&nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp=

; &nbsp; &nbsp; &nbsp;onKeyDown={(e) =&gt; e.key === 'Enter' &amp=

;&amp; addDishToMeal(type, manualInputs[type])}</div>

<div style="font-family: Aptos, Aptos_MSFontService, -apple-system, Robot=

o, Arial, Helvetica, sans-serif; font-size: 12pt; color: rgb(33, 33, 33);" =

dir="auto">

&nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp=

; &nbsp; &nbsp;/&gt;</div>

<div style="font-family: Aptos, Aptos_MSFontService, -apple-system, Robot=

o, Arial, Helvetica, sans-serif; font-size: 12pt; color: rgb(33, 33, 33);" =

dir="auto">

&nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp=

; &nbsp; &nbsp;&lt;button onClick={() =&gt; addDishToMeal(type, manualI=

nputs[type])} className=&quot;p-2 bg-slate-100 text-slate-600 rounded-xl&=

quot;&gt;&lt;Send size={16}/&gt;&lt;/button&gt;</div>

<div style="font-family: Aptos, Aptos_MSFontService, -apple-system, Robot=

o, Arial, Helvetica, sans-serif; font-size: 12pt; color: rgb(33, 33, 33);" =

dir="auto">

&nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp=

; &nbsp;&lt;/div&gt;</div>

<div style="font-family: Aptos, Aptos_MSFontService, -apple-system, Robot=

o, Arial, Helvetica, sans-serif; font-size: 12pt; color: rgb(33, 33, 33);" =

dir="auto">

<br>

</div>

<div style="font-family: Aptos, Aptos_MSFontService, -apple-system, Robot=

o, Arial, Helvetica, sans-serif; font-size: 12pt; color: rgb(33, 33, 33);" =

dir="auto">

&nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp=

; &nbsp;&lt;div className=&quot;space-y-2&quot;&gt;</div>

<div style="font-family: Aptos, Aptos_MSFontService, -apple-system, Robot=

o, Arial, Helvetica, sans-serif; font-size: 12pt; color: rgb(33, 33, 33);" =

dir="auto">

&nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp=

; &nbsp; {dishList.map((dish, i) =&gt; (</div>

<div style="font-family: Aptos, Aptos_MSFontService, -apple-system, Robot=

o, Arial, Helvetica, sans-serif; font-size: 12pt; color: rgb(33, 33, 33);" =

dir="auto">

&nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp=

; &nbsp; &nbsp; &lt;div key={i} className=&quot;flex items-center justi=

fy-between bg-slate-50 px-4 py-3 rounded-xl border border-slate-100&quot;&g=

t;</div>

<div style="font-family: Aptos, Aptos_MSFontService, -apple-system, Robot=

o, Arial, Helvetica, sans-serif; font-size: 12pt; color: rgb(33, 33, 33);" =

dir="auto">

&nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp=

; &nbsp; &nbsp; &nbsp; &lt;span className=&quot;text-sm font-bold text-sl=

ate-800 break-words flex-1 pr-2&quot;&gt;{dish}&lt;/span&gt;</div>

<div style="font-family: Aptos, Aptos_MSFontService, -apple-system, Robot=

o, Arial, Helvetica, sans-serif; font-size: 12pt; color: rgb(33, 33, 33);" =

dir="auto">

&nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp=

; &nbsp; &nbsp; &nbsp; &lt;button onClick={() =&gt; removeDish(type, i)=

} className=&quot;text-slate-300 flex-shrink-0&quot;&gt;&lt;X size={14}=

/&gt;&lt;/button&gt;</div>

<div style="font-family: Aptos, Aptos_MSFontService, -apple-system, Robot=

o, Arial, Helvetica, sans-serif; font-size: 12pt; color: rgb(33, 33, 33);" =

dir="auto">

&nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp=

; &nbsp; &nbsp; &lt;/div&gt;</div>

<div style="font-family: Aptos, Aptos_MSFontService, -apple-system, Robot=

o, Arial, Helvetica, sans-serif; font-size: 12pt; color: rgb(33, 33, 33);" =

dir="auto">

&nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp=

; &nbsp; ))}</div>

<div style="font-family: Aptos, Aptos_MSFontService, -apple-system, Robot=

o, Arial, Helvetica, sans-serif; font-size: 12pt; color: rgb(33, 33, 33);" =

dir="auto">

&nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp=

; &lt;/div&gt;</div>

<div style="font-family: Aptos, Aptos_MSFontService, -apple-system, Robot=

o, Arial, Helvetica, sans-serif; font-size: 12pt; color: rgb(33, 33, 33);" =

dir="auto">

&nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &lt;/=

div&gt;</div>

<div style="font-family: Aptos, Aptos_MSFontService, -apple-system, Robot=

o, Arial, Helvetica, sans-serif; font-size: 12pt; color: rgb(33, 33, 33);" =

dir="auto">

<br>

</div>

<div style="font-family: Aptos, Aptos_MSFontService, -apple-system, Robot=

o, Arial, Helvetica, sans-serif; font-size: 12pt; color: rgb(33, 33, 33);" =

dir="auto">

&nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &lt;d=

iv className=&quot;bg-slate-50/50 rounded-xl p-3 border border-slate-50 o=

verflow-hidden&quot;&gt;</div>

<div style="font-family: Aptos, Aptos_MSFontService, -apple-system, Robot=

o, Arial, Helvetica, sans-serif; font-size: 12pt; color: rgb(33, 33, 33);" =

dir="auto">

&nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp=

; &lt;div className=&quot;flex items-center justify-between mb-1&quot;&gt=

;</div>

<div style="font-family: Aptos, Aptos_MSFontService, -apple-system, Robot=

o, Arial, Helvetica, sans-serif; font-size: 12pt; color: rgb(33, 33, 33);" =

dir="auto">

&nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp=

; &nbsp; &lt;span className=&quot;text-[8px] font-black uppercase text-sl=

ate-400&quot;&gt;Cooking Details&lt;/span&gt;</div>

<div style="font-family: Aptos, Aptos_MSFontService, -apple-system, Robot=

o, Arial, Helvetica, sans-serif; font-size: 12pt; color: rgb(33, 33, 33);" =

dir="auto">

&nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp=

; &nbsp; &lt;button onClick={() =&gt; setEditingRemark(isEdit ? null : =

{ type, value: m?.remark || '' })} className=&quot;text-[8px] font-black =

uppercase text-indigo-600 underline&quot;&gt;Edit&lt;/button&gt;</div>

<div style="font-family: Aptos, Aptos_MSFontService, -apple-system, Robot=

o, Arial, Helvetica, sans-serif; font-size: 12pt; color: rgb(33, 33, 33);" =

dir="auto">

&nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp=

; &lt;/div&gt;</div>

<div style="font-family: Aptos, Aptos_MSFontService, -apple-system, Robot=

o, Arial, Helvetica, sans-serif; font-size: 12pt; color: rgb(33, 33, 33);" =

dir="auto">

&nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp=

; {isEdit ? (</div>

<div style="font-family: Aptos, Aptos_MSFontService, -apple-system, Robot=

o, Arial, Helvetica, sans-serif; font-size: 12pt; color: rgb(33, 33, 33);" =

dir="auto">

&nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp=

; &nbsp; &lt;div className=&quot;space-y-2&quot;&gt;</div>

<div style="font-family: Aptos, Aptos_MSFontService, -apple-system, Robot=

o, Arial, Helvetica, sans-serif; font-size: 12pt; color: rgb(33, 33, 33);" =

dir="auto">

&nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp=

; &nbsp; &nbsp; &lt;textarea className=&quot;w-full bg-white border borde=

r-slate-200 rounded-lg p-2 text-sm font-bold&quot; rows={4} value={edit=

ingRemark.value} onChange={(e) =&gt; setEditingRemark({ ...editingRemar=

k, value: e.target.value })} /&gt;</div>

<div style="font-family: Aptos, Aptos_MSFontService, -apple-system, Robot=

o, Arial, Helvetica, sans-serif; font-size: 12pt; color: rgb(33, 33, 33);" =

dir="auto">

&nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp=

; &nbsp; &nbsp; &lt;button onClick={() =&gt; saveMealNote(type)} classN=

ame=&quot;w-full py-2 bg-indigo-600 text-white rounded-lg text-[10px] fon=

t-black uppercase shadow-lg&quot;&gt;Save &amp; Format&lt;/button&gt;</div>

<div style="font-family: Aptos, Aptos_MSFontService, -apple-system, Robot=

o, Arial, Helvetica, sans-serif; font-size: 12pt; color: rgb(33, 33, 33);" =

dir="auto">

&nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp=

; &nbsp; &lt;/div&gt;</div>

<div style="font-family: Aptos, Aptos_MSFontService, -apple-system, Robot=

o, Arial, Helvetica, sans-serif; font-size: 12pt; color: rgb(33, 33, 33);" =

dir="auto">

&nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp=

; ) : (</div>

<div style="font-family: Aptos, Aptos_MSFontService, -apple-system, Robot=

o, Arial, Helvetica, sans-serif; font-size: 12pt; color: rgb(33, 33, 33);" =

dir="auto">

&nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp=

; &nbsp; &lt;div className=&quot;text-sm font-bold text-slate-600 leading=

-relaxed whitespace-pre-wrap break-words w-full&quot;&gt;</div>

<div style="font-family: Aptos, Aptos_MSFontService, -apple-system, Robot=

o, Arial, Helvetica, sans-serif; font-size: 12pt; color: rgb(33, 33, 33);" =

dir="auto">

&nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp=

; &nbsp; &nbsp; {m?.remark || 'No details added...'}</div>

<div style="font-family: Aptos, Aptos_MSFontService, -apple-system, Robot=

o, Arial, Helvetica, sans-serif; font-size: 12pt; color: rgb(33, 33, 33);" =

dir="auto">

&nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp=

; &nbsp; &lt;/div&gt;</div>

<div style="font-family: Aptos, Aptos_MSFontService, -apple-system, Robot=

o, Arial, Helvetica, sans-serif; font-size: 12pt; color: rgb(33, 33, 33);" =

dir="auto">

&nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp=

; )}</div>

<div style="font-family: Aptos, Aptos_MSFontService, -apple-system, Robot=

o, Arial, Helvetica, sans-serif; font-size: 12pt; color: rgb(33, 33, 33);" =

dir="auto">

&nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &lt;/=

div&gt;</div>

<div style="font-family: Aptos, Aptos_MSFontService, -apple-system, Robot=

o, Arial, Helvetica, sans-serif; font-size: 12pt; color: rgb(33, 33, 33);" =

dir="auto">

&nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &lt;/div&gt;=

</div>

<div style="font-family: Aptos, Aptos_MSFontService, -apple-system, Robot=

o, Arial, Helvetica, sans-serif; font-size: 12pt; color: rgb(33, 33, 33);" =

dir="auto">

&nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; );</div>

<div style="font-family: Aptos, Aptos_MSFontService, -apple-system, Robot=

o, Arial, Helvetica, sans-serif; font-size: 12pt; color: rgb(33, 33, 33);" =

dir="auto">

&nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; })}</div>

<div style="font-family: Aptos, Aptos_MSFontService, -apple-system, Robot=

o, Arial, Helvetica, sans-serif; font-size: 12pt; color: rgb(33, 33, 33);" =

dir="auto">

&nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &lt;/div&gt;</div>

<div style="font-family: Aptos, Aptos_MSFontService, -apple-system, Robot=

o, Arial, Helvetica, sans-serif; font-size: 12pt; color: rgb(33, 33, 33);" =

dir="auto">

&nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &lt;/div&gt;</div>

<div style="font-family: Aptos, Aptos_MSFontService, -apple-system, Robot=

o, Arial, Helvetica, sans-serif; font-size: 12pt; color: rgb(33, 33, 33);" =

dir="auto">

&nbsp; &nbsp; &nbsp; &nbsp; )}</div>

<div style="font-family: Aptos, Aptos_MSFontService, -apple-system, Robot=

o, Arial, Helvetica, sans-serif; font-size: 12pt; color: rgb(33, 33, 33);" =

dir="auto">

<br>

</div>

<div style="font-family: Aptos, Aptos_MSFontService, -apple-system, Robot=

o, Arial, Helvetica, sans-serif; font-size: 12pt; color: rgb(33, 33, 33);" =

dir="auto">

&nbsp; &nbsp; &nbsp; &nbsp; {activeTab === 'groceries' &amp;&amp; (</=

div>

<div style="font-family: Aptos, Aptos_MSFontService, -apple-system, Robot=

o, Arial, Helvetica, sans-serif; font-size: 12pt; color: rgb(33, 33, 33);" =

dir="auto">

&nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &lt;div className=&quot;space-y-4&quot=

;&gt;</div>

<div style="font-family: Aptos, Aptos_MSFontService, -apple-system, Robot=

o, Arial, Helvetica, sans-serif; font-size: 12pt; color: rgb(33, 33, 33);" =

dir="auto">

&nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &lt;div className=&quot;flex ga=

p-2&quot;&gt;</div>

<div style="font-family: Aptos, Aptos_MSFontService, -apple-system, Robot=

o, Arial, Helvetica, sans-serif; font-size: 12pt; color: rgb(33, 33, 33);" =

dir="auto">

&nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &lt;input type=&quot;tex=

t&quot; placeholder=&quot;Grocery item...&quot; className=&quot;flex-1 =

px-5 py-4 rounded-2xl bg-white border border-slate-200 outline-none font-bo=

ld text-sm shadow-sm&quot; value={newGrocery} onChange={(e) =&gt; set=

NewGrocery(e.target.value)} onKeyDown={(e)

 =&gt; e.key === 'Enter' &amp;&amp; handleAddGrocery()} /&gt;</div>

<div style="font-family: Aptos, Aptos_MSFontService, -apple-system, Robot=

o, Arial, Helvetica, sans-serif; font-size: 12pt; color: rgb(33, 33, 33);" =

dir="auto">

&nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &lt;button onClick={hand=

leAddGrocery} className=&quot;bg-indigo-600 text-white px-5 rounded-2xl s=

hadow-lg&quot;&gt;&lt;Plus size={24}/&gt;&lt;/button&gt;</div>

<div style="font-family: Aptos, Aptos_MSFontService, -apple-system, Robot=

o, Arial, Helvetica, sans-serif; font-size: 12pt; color: rgb(33, 33, 33);" =

dir="auto">

&nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &lt;/div&gt;</div>

<div style="font-family: Aptos, Aptos_MSFontService, -apple-system, Robot=

o, Arial, Helvetica, sans-serif; font-size: 12pt; color: rgb(33, 33, 33);" =

dir="auto">

&nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &lt;div className=&quot;space-y=

-2&quot;&gt;</div>

<div style="font-family: Aptos, Aptos_MSFontService, -apple-system, Robot=

o, Arial, Helvetica, sans-serif; font-size: 12pt; color: rgb(33, 33, 33);" =

dir="auto">

&nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; {(groceries || []).sort((a=

,b) =&gt; (b.createdAt || 0) - (a.createdAt || 0)).map(item =&gt; (</di=

v>

<div style="font-family: Aptos, Aptos_MSFontService, -apple-system, Robot=

o, Arial, Helvetica, sans-serif; font-size: 12pt; color: rgb(33, 33, 33);" =

dir="auto">

&nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &lt;div key={item=

.id} className=&quot;bg-white p-5 rounded-2xl flex items-center gap-3 sha=

dow-sm border border-slate-50 transition-all active:scale-[0.98]&quot;&gt;<=

/div>

<div style="font-family: Aptos, Aptos_MSFontService, -apple-system, Robot=

o, Arial, Helvetica, sans-serif; font-size: 12pt; color: rgb(33, 33, 33);" =

dir="auto">

&nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &lt;button o=

nClick={() =&gt; updateDoc(getHubRef('groceries', item.id), { completed=

: !item.completed })} className=&quot;flex-shrink-0&quot;&gt;{item.comple=

ted ? &lt;CheckCircle2 className=&quot;text-emerald-500&quot; size={24}=

/&gt; : &lt;Circle className=&quot;text-slate-200&quot; size={24}/&gt;}=

&lt;/button&gt;</div>

<div style="font-family: Aptos, Aptos_MSFontService, -apple-system, Robot=

o, Arial, Helvetica, sans-serif; font-size: 12pt; color: rgb(33, 33, 33);" =

dir="auto">

&nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &lt;span cla=

ssName={`flex-1 text-sm font-bold break-words ${item.completed ? 'line-th=

rough text-slate-300' : 'text-slate-700'}`}&gt;{item.text}&lt;/span&gt;</di=

v>

<div style="font-family: Aptos, Aptos_MSFontService, -apple-system, Robot=

o, Arial, Helvetica, sans-serif; font-size: 12pt; color: rgb(33, 33, 33);" =

dir="auto">

&nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &lt;button o=

nClick={() =&gt; deleteDoc(getHubRef('groceries', item.id))} className=

=&quot;text-slate-200 hover:text-rose-500 transition-colors flex-shrink-0=

&quot;&gt;&lt;Trash2 size={16}/&gt;&lt;/button&gt;</div>

<div style="font-family: Aptos, Aptos_MSFontService, -apple-system, Robot=

o, Arial, Helvetica, sans-serif; font-size: 12pt; color: rgb(33, 33, 33);" =

dir="auto">

&nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &lt;/div&gt;</div>

<div style="font-family: Aptos, Aptos_MSFontService, -apple-system, Robot=

o, Arial, Helvetica, sans-serif; font-size: 12pt; color: rgb(33, 33, 33);" =

dir="auto">

&nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; ))}</div>

<div style="font-family: Aptos, Aptos_MSFontService, -apple-system, Robot=

o, Arial, Helvetica, sans-serif; font-size: 12pt; color: rgb(33, 33, 33);" =

dir="auto">

&nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &lt;/div&gt;</div>

<div style="font-family: Aptos, Aptos_MSFontService, -apple-system, Robot=

o, Arial, Helvetica, sans-serif; font-size: 12pt; color: rgb(33, 33, 33);" =

dir="auto">

&nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &lt;/div&gt;</div>

<div style="font-family: Aptos, Aptos_MSFontService, -apple-system, Robot=

o, Arial, Helvetica, sans-serif; font-size: 12pt; color: rgb(33, 33, 33);" =

dir="auto">

&nbsp; &nbsp; &nbsp; &nbsp; )}</div>

<div style="font-family: Aptos, Aptos_MSFontService, -apple-system, Robot=

o, Arial, Helvetica, sans-serif; font-size: 12pt; color: rgb(33, 33, 33);" =

dir="auto">

<br>

</div>

<div style="font-family: Aptos, Aptos_MSFontService, -apple-system, Robot=

o, Arial, Helvetica, sans-serif; font-size: 12pt; color: rgb(33, 33, 33);" =

dir="auto">

&nbsp; &nbsp; &nbsp; &nbsp; {activeTab === 'settings' &amp;&amp; (</d=

iv>

<div style="font-family: Aptos, Aptos_MSFontService, -apple-system, Robot=

o, Arial, Helvetica, sans-serif; font-size: 12pt; color: rgb(33, 33, 33);" =

dir="auto">

&nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &lt;div className=&quot;bg-white round=

ed-[2rem] p-8 shadow-sm border border-slate-100 space-y-8&quot;&gt;</div>

<div style="font-family: Aptos, Aptos_MSFontService, -apple-system, Robot=

o, Arial, Helvetica, sans-serif; font-size: 12pt; color: rgb(33, 33, 33);" =

dir="auto">

&nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &lt;section&gt;</div>

<div style="font-family: Aptos, Aptos_MSFontService, -apple-system, Robot=

o, Arial, Helvetica, sans-serif; font-size: 12pt; color: rgb(33, 33, 33);" =

dir="auto">

&nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &lt;h3 className=&quot;t=

ext-[10px] font-black text-indigo-600 uppercase mb-4 tracking-widest flex i=

tems-center gap-2&quot;&gt;&lt;Info size={14}/&gt; App Info&lt;/h3&gt;</d=

iv>

<div style="font-family: Aptos, Aptos_MSFontService, -apple-system, Robot=

o, Arial, Helvetica, sans-serif; font-size: 12pt; color: rgb(33, 33, 33);" =

dir="auto">

&nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &lt;div className=&quot;=

bg-slate-50 p-4 rounded-2xl border border-slate-100&quot;&gt;</div>

<div style="font-family: Aptos, Aptos_MSFontService, -apple-system, Robot=

o, Arial, Helvetica, sans-serif; font-size: 12pt; color: rgb(33, 33, 33);" =

dir="auto">

&nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &lt;p className=&=

quot;text-[9px] font-black text-slate-400 uppercase mb-1&quot;&gt;Hub Ident=

ifier&lt;/p&gt;</div>

<div style="font-family: Aptos, Aptos_MSFontService, -apple-system, Robot=

o, Arial, Helvetica, sans-serif; font-size: 12pt; color: rgb(33, 33, 33);" =

dir="auto">

&nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &lt;p className=&=

quot;font-mono text-xs font-black text-slate-700 break-all bg-white p-3 rou=

nded-lg border border-slate-100 shadow-inner select-all&quot;&gt;{appId}&lt=

;/p&gt;</div>

<div style="font-family: Aptos, Aptos_MSFontService, -apple-system, Robot=

o, Arial, Helvetica, sans-serif; font-size: 12pt; color: rgb(33, 33, 33);" =

dir="auto">

&nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &lt;/div&gt;</div>

<div style="font-family: Aptos, Aptos_MSFontService, -apple-system, Robot=

o, Arial, Helvetica, sans-serif; font-size: 12pt; color: rgb(33, 33, 33);" =

dir="auto">

&nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &lt;/section&gt;</div>

<div style="font-family: Aptos, Aptos_MSFontService, -apple-system, Robot=

o, Arial, Helvetica, sans-serif; font-size: 12pt; color: rgb(33, 33, 33);" =

dir="auto">

&nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &lt;section&gt;</div>

<div style="font-family: Aptos, Aptos_MSFontService, -apple-system, Robot=

o, Arial, Helvetica, sans-serif; font-size: 12pt; color: rgb(33, 33, 33);" =

dir="auto">

&nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &lt;h3 className=&quot;t=

ext-[10px] font-black text-indigo-600 uppercase mb-4 tracking-widest flex i=

tems-center gap-2&quot;&gt;&lt;Zap size={14}/&gt; Access Control&lt;/h3&g=

t;</div>

<div style="font-family: Aptos, Aptos_MSFontService, -apple-system, Robot=

o, Arial, Helvetica, sans-serif; font-size: 12pt; color: rgb(33, 33, 33);" =

dir="auto">

&nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &lt;div className=&quot;=

flex gap-2&quot;&gt;</div>

<div style="font-family: Aptos, Aptos_MSFontService, -apple-system, Robot=

o, Arial, Helvetica, sans-serif; font-size: 12pt; color: rgb(33, 33, 33);" =

dir="auto">

&nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &lt;input type=&q=

uot;password&quot; placeholder=&quot;Hub PIN&quot; maxLength={6} classN=

ame=&quot;flex-1 bg-slate-50 px-4 py-3 rounded-xl font-black text-center =

tracking-widest border border-slate-100&quot; value={newPin} onChange={=

(e) =&gt; setNewPin(e.target.value.replace(/\D/g,''))}

 /&gt;</div>

<div style="font-family: Aptos, Aptos_MSFontService, -apple-system, Robot=

o, Arial, Helvetica, sans-serif; font-size: 12pt; color: rgb(33, 33, 33);" =

dir="auto">

&nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &lt;button onClick=

={async () =&gt; { if(newPin.length &gt;= 4) { await setDoc(doc(fireb=

aseRefs.db, 'artifacts', appId, 'public', 'data', 'pins', newPin), { hubKey=

: activeProfile.hubKey, name: activeProfile.name, phone: activeProfile.phon=

e, createdAt:

 Date.now() }); setNewPin(''); } }} className=&quot;bg-indigo-600 text-wh=

ite px-5 rounded-xl text-[10px] font-black uppercase tracking-widest&quot;&=

gt;Set&lt;/button&gt;</div>

<div style="font-family: Aptos, Aptos_MSFontService, -apple-system, Robot=

o, Arial, Helvetica, sans-serif; font-size: 12pt; color: rgb(33, 33, 33);" =

dir="auto">

&nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &lt;/div&gt;</div>

<div style="font-family: Aptos, Aptos_MSFontService, -apple-system, Robot=

o, Arial, Helvetica, sans-serif; font-size: 12pt; color: rgb(33, 33, 33);" =

dir="auto">

&nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &lt;/section&gt;</div>

<div style="font-family: Aptos, Aptos_MSFontService, -apple-system, Robot=

o, Arial, Helvetica, sans-serif; font-size: 12pt; color: rgb(33, 33, 33);" =

dir="auto">

&nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &lt;section className=&quot;pt-=

4&quot;&gt;</div>

<div style="font-family: Aptos, Aptos_MSFontService, -apple-system, Robot=

o, Arial, Helvetica, sans-serif; font-size: 12pt; color: rgb(33, 33, 33);" =

dir="auto">

&nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &lt;button onClick={() =

=&gt; { setActiveProfile(null); }} className=&quot;w-full py-4 text-sla=

te-400 font-black text-[10px] uppercase tracking-widest bg-slate-100 rounde=

d-xl hover:bg-slate-200 transition-colors&quot;&gt;Log Out Profile&lt;/butt=

on&gt;</div>

<div style="font-family: Aptos, Aptos_MSFontService, -apple-system, Robot=

o, Arial, Helvetica, sans-serif; font-size: 12pt; color: rgb(33, 33, 33);" =

dir="auto">

&nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &lt;/section&gt;</div>

<div style="font-family: Aptos, Aptos_MSFontService, -apple-system, Robot=

o, Arial, Helvetica, sans-serif; font-size: 12pt; color: rgb(33, 33, 33);" =

dir="auto">

&nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &lt;/div&gt;</div>

<div style="font-family: Aptos, Aptos_MSFontService, -apple-system, Robot=

o, Arial, Helvetica, sans-serif; font-size: 12pt; color: rgb(33, 33, 33);" =

dir="auto">

&nbsp; &nbsp; &nbsp; &nbsp; )}</div>

<div style="font-family: Aptos, Aptos_MSFontService, -apple-system, Robot=

o, Arial, Helvetica, sans-serif; font-size: 12pt; color: rgb(33, 33, 33);" =

dir="auto">

&nbsp; &nbsp; &nbsp; &lt;/main&gt;</div>

<div style="font-family: Aptos, Aptos_MSFontService, -apple-system, Robot=

o, Arial, Helvetica, sans-serif; font-size: 12pt; color: rgb(33, 33, 33);" =

dir="auto">

<br>

</div>

<div style="font-family: Aptos, Aptos_MSFontService, -apple-system, Robot=

o, Arial, Helvetica, sans-serif; font-size: 12pt; color: rgb(33, 33, 33);" =

dir="auto">

&nbsp; &nbsp; &nbsp; {isLibraryOpen &amp;&amp; (</div>

<div style="font-family: Aptos, Aptos_MSFontService, -apple-system, Robot=

o, Arial, Helvetica, sans-serif; font-size: 12pt; color: rgb(33, 33, 33);" =

dir="auto">

&nbsp; &nbsp; &nbsp; &nbsp; &lt;div className=&quot;fixed inset-0 bg-slat=

e-900/60 backdrop-blur-md z-50 flex items-end sm:items-center justify-cente=

r p-3&quot;&gt;</div>

<div style="font-family: Aptos, Aptos_MSFontService, -apple-system, Robot=

o, Arial, Helvetica, sans-serif; font-size: 12pt; color: rgb(33, 33, 33);" =

dir="auto">

&nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &lt;div className=&quot;bg-white w-ful=

l max-w-md rounded-[2.5rem] shadow-2xl max-h-[85vh] flex flex-col overflow-=

hidden&quot;&gt;</div>

<div style="font-family: Aptos, Aptos_MSFontService, -apple-system, Robot=

o, Arial, Helvetica, sans-serif; font-size: 12pt; color: rgb(33, 33, 33);" =

dir="auto">

&nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &lt;div className=&quot;p-6 bor=

der-b flex justify-between items-center bg-white sticky top-0 z-10&quot;&gt=

;</div>

<div style="font-family: Aptos, Aptos_MSFontService, -apple-system, Robot=

o, Arial, Helvetica, sans-serif; font-size: 12pt; color: rgb(33, 33, 33);" =

dir="auto">

&nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &lt;div className=&quot;=

flex items-center gap-2&quot;&gt;</div>

<div style="font-family: Aptos, Aptos_MSFontService, -apple-system, Robot=

o, Arial, Helvetica, sans-serif; font-size: 12pt; color: rgb(33, 33, 33);" =

dir="auto">

&nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; {currentCategoryId =

&amp;&amp; &lt;button onClick={() =&gt; setCurrentCategoryId(null)} cla=

ssName=&quot;p-2 bg-slate-100 rounded-xl&quot;&gt;&lt;ChevronLeft size==

{18}/&gt;&lt;/button&gt;}</div>

<div style="font-family: Aptos, Aptos_MSFontService, -apple-system, Robot=

o, Arial, Helvetica, sans-serif; font-size: 12pt; color: rgb(33, 33, 33);" =

dir="auto">

&nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &lt;h2 className==

&quot;text-sm font-black text-slate-900 uppercase tracking-tight&quot;&gt;{=

currentCategoryId ? (categories || []).find(c =&gt; c.id === curren=

tCategoryId)?.name : &quot;Categories&quot;}&lt;/h2&gt;</div>

<div style="font-family: Aptos, Aptos_MSFontService, -apple-system, Robot=

o, Arial, Helvetica, sans-serif; font-size: 12pt; color: rgb(33, 33, 33);" =

dir="auto">

&nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &lt;/div&gt;</div>

<div style="font-family: Aptos, Aptos_MSFontService, -apple-system, Robot=

o, Arial, Helvetica, sans-serif; font-size: 12pt; color: rgb(33, 33, 33);" =

dir="auto">

&nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &lt;button onClick={() =

=&gt; setIsLibraryOpen(false)} className=&quot;p-2 text-slate-300 bg-sl=

ate-50 rounded-xl&quot;&gt;&lt;X size={18}/&gt;&lt;/button&gt;</div>

<div style="font-family: Aptos, Aptos_MSFontService, -apple-system, Robot=

o, Arial, Helvetica, sans-serif; font-size: 12pt; color: rgb(33, 33, 33);" =

dir="auto">

&nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &lt;/div&gt;</div>

<div style="font-family: Aptos, Aptos_MSFontService, -apple-system, Robot=

o, Arial, Helvetica, sans-serif; font-size: 12pt; color: rgb(33, 33, 33);" =

dir="auto">

&nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp;&nbsp;</div>

<div style="font-family: Aptos, Aptos_MSFontService, -apple-system, Robot=

o, Arial, Helvetica, sans-serif; font-size: 12pt; color: rgb(33, 33, 33);" =

dir="auto">

&nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &lt;div className=&quot;p-6 ove=

rflow-y-auto flex-1 space-y-4&quot;&gt;</div>

<div style="font-family: Aptos, Aptos_MSFontService, -apple-system, Robot=

o, Arial, Helvetica, sans-serif; font-size: 12pt; color: rgb(33, 33, 33);" =

dir="auto">

&nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; {!currentCategoryId ? (</d=

iv>

<div style="font-family: Aptos, Aptos_MSFontService, -apple-system, Robot=

o, Arial, Helvetica, sans-serif; font-size: 12pt; color: rgb(33, 33, 33);" =

dir="auto">

&nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &lt;div className=

=&quot;space-y-4&quot;&gt;</div>

<div style="font-family: Aptos, Aptos_MSFontService, -apple-system, Robot=

o, Arial, Helvetica, sans-serif; font-size: 12pt; color: rgb(33, 33, 33);" =

dir="auto">

&nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &lt;div clas=

sName=&quot;flex gap-2&quot;&gt;</div>

<div style="font-family: Aptos, Aptos_MSFontService, -apple-system, Robot=

o, Arial, Helvetica, sans-serif; font-size: 12pt; color: rgb(33, 33, 33);" =

dir="auto">

&nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &lt;i=

nput type=&quot;text&quot; placeholder=&quot;Add Category...&quot; clas=

sName=&quot;flex-1 px-4 py-3 bg-slate-50 rounded-xl font-bold text-sm out=

line-none border border-transparent focus:border-indigo-100&quot; value={=

newCategoryName} onChange={(e) =&gt; setNewCategoryName(e.target.value)=

}

 onKeyDown={(e) =&gt; e.key === 'Enter' &amp;&amp; handleCreateCa=

tegory()}/&gt;</div>

<div style="font-family: Aptos, Aptos_MSFontService, -apple-system, Robot=

o, Arial, Helvetica, sans-serif; font-size: 12pt; color: rgb(33, 33, 33);" =

dir="auto">

&nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &lt;b=

utton onClick={handleCreateCategory} className=&quot;bg-indigo-600 text=

-white px-4 rounded-xl shadow-md&quot;&gt;&lt;FolderPlus size={18}/&gt;&l=

t;/button&gt;</div>

<div style="font-family: Aptos, Aptos_MSFontService, -apple-system, Robot=

o, Arial, Helvetica, sans-serif; font-size: 12pt; color: rgb(33, 33, 33);" =

dir="auto">

&nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &lt;/div&gt;=

</div>

<div style="font-family: Aptos, Aptos_MSFontService, -apple-system, Robot=

o, Arial, Helvetica, sans-serif; font-size: 12pt; color: rgb(33, 33, 33);" =

dir="auto">

&nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &lt;div clas=

sName=&quot;space-y-2&quot;&gt;</div>

<div style="font-family: Aptos, Aptos_MSFontService, -apple-system, Robot=

o, Arial, Helvetica, sans-serif; font-size: 12pt; color: rgb(33, 33, 33);" =

dir="auto">

&nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; {(cat=

egories || []).map(cat =&gt; (</div>

<div style="font-family: Aptos, Aptos_MSFontService, -apple-system, Robot=

o, Arial, Helvetica, sans-serif; font-size: 12pt; color: rgb(33, 33, 33);" =

dir="auto">

&nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp=

; &lt;button key={cat.id} onClick={() =&gt; setCurrentCategoryId(cat.=

id)} className=&quot;w-full flex items-center justify-between p-4 bg-slat=

e-50 rounded-2xl border border-slate-100 group transition-all&quot;&gt;</di=

v>

<div style="font-family: Aptos, Aptos_MSFontService, -apple-system, Robot=

o, Arial, Helvetica, sans-serif; font-size: 12pt; color: rgb(33, 33, 33);" =

dir="auto">

&nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp=

; &nbsp; &lt;div className=&quot;flex items-center gap-3&quot;&gt;</div>

<div style="font-family: Aptos, Aptos_MSFontService, -apple-system, Robot=

o, Arial, Helvetica, sans-serif; font-size: 12pt; color: rgb(33, 33, 33);" =

dir="auto">

&nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp=

; &nbsp; &nbsp; &lt;Tag size={16} className=&quot;text-indigo-500&quot;=

/&gt;</div>

<div style="font-family: Aptos, Aptos_MSFontService, -apple-system, Robot=

o, Arial, Helvetica, sans-serif; font-size: 12pt; color: rgb(33, 33, 33);" =

dir="auto">

&nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp=

; &nbsp; &nbsp; &lt;span className=&quot;font-bold text-slate-700 upperca=

se text-xs text-left&quot;&gt;{cat.name}&lt;/span&gt;</div>

<div style="font-family: Aptos, Aptos_MSFontService, -apple-system, Robot=

o, Arial, Helvetica, sans-serif; font-size: 12pt; color: rgb(33, 33, 33);" =

dir="auto">

&nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp=

; &nbsp; &lt;/div&gt;</div>

<div style="font-family: Aptos, Aptos_MSFontService, -apple-system, Robot=

o, Arial, Helvetica, sans-serif; font-size: 12pt; color: rgb(33, 33, 33);" =

dir="auto">

&nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp=

; &nbsp; &lt;div className=&quot;flex items-center gap-2&quot;&gt;</div>

<div style="font-family: Aptos, Aptos_MSFontService, -apple-system, Robot=

o, Arial, Helvetica, sans-serif; font-size: 12pt; color: rgb(33, 33, 33);" =

dir="auto">

&nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp=

; &nbsp; &nbsp; &lt;span className=&quot;text-[9px] font-black text-slate=

-300 uppercase whitespace-nowrap&quot;&gt;{(dishes || []).filter(d =&gt; =

d.categoryId === cat.id).length} Dishes&lt;/span&gt;</div>

<div style="font-family: Aptos, Aptos_MSFontService, -apple-system, Robot=

o, Arial, Helvetica, sans-serif; font-size: 12pt; color: rgb(33, 33, 33);" =

dir="auto">

&nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp=

; &nbsp; &nbsp; &lt;ChevronRightIcon size={14} className=&quot;text-sla=

te-300&quot;/&gt;</div>

<div style="font-family: Aptos, Aptos_MSFontService, -apple-system, Robot=

o, Arial, Helvetica, sans-serif; font-size: 12pt; color: rgb(33, 33, 33);" =

dir="auto">

&nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp=

; &nbsp; &lt;/div&gt;</div>

<div style="font-family: Aptos, Aptos_MSFontService, -apple-system, Robot=

o, Arial, Helvetica, sans-serif; font-size: 12pt; color: rgb(33, 33, 33);" =

dir="auto">

&nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp=

; &lt;/button&gt;</div>

<div style="font-family: Aptos, Aptos_MSFontService, -apple-system, Robot=

o, Arial, Helvetica, sans-serif; font-size: 12pt; color: rgb(33, 33, 33);" =

dir="auto">

&nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; ))}</=

div>

<div style="font-family: Aptos, Aptos_MSFontService, -apple-system, Robot=

o, Arial, Helvetica, sans-serif; font-size: 12pt; color: rgb(33, 33, 33);" =

dir="auto">

&nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &lt;/div&gt;=

</div>

<div style="font-family: Aptos, Aptos_MSFontService, -apple-system, Robot=

o, Arial, Helvetica, sans-serif; font-size: 12pt; color: rgb(33, 33, 33);" =

dir="auto">

&nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &lt;/div&gt;</div>

<div style="font-family: Aptos, Aptos_MSFontService, -apple-system, Robot=

o, Arial, Helvetica, sans-serif; font-size: 12pt; color: rgb(33, 33, 33);" =

dir="auto">

&nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; ) : (</div>

<div style="font-family: Aptos, Aptos_MSFontService, -apple-system, Robot=

o, Arial, Helvetica, sans-serif; font-size: 12pt; color: rgb(33, 33, 33);" =

dir="auto">

&nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &lt;div className=

=&quot;space-y-4&quot;&gt;</div>

<div style="font-family: Aptos, Aptos_MSFontService, -apple-system, Robot=

o, Arial, Helvetica, sans-serif; font-size: 12pt; color: rgb(33, 33, 33);" =

dir="auto">

&nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &lt;div clas=

sName=&quot;flex gap-2&quot;&gt;</div>

<div style="font-family: Aptos, Aptos_MSFontService, -apple-system, Robot=

o, Arial, Helvetica, sans-serif; font-size: 12pt; color: rgb(33, 33, 33);" =

dir="auto">

&nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &lt;i=

nput type=&quot;text&quot; placeholder=&quot;Add single dish...&quot; c=

lassName=&quot;flex-1 px-4 py-3 bg-slate-50 rounded-xl font-bold text-sm =

outline-none border focus:border-indigo-100&quot; value={newDishName} onC=

hange={(e) =&gt; setNewDishName(e.target.value)} onKeyDown={(e)

 =&gt; e.key === 'Enter' &amp;&amp; handleAddDishToLib()}/&gt;</div=

>

<div style="font-family: Aptos, Aptos_MSFontService, -apple-system, Robot=

o, Arial, Helvetica, sans-serif; font-size: 12pt; color: rgb(33, 33, 33);" =

dir="auto">

&nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &lt;b=

utton onClick={handleAddDishToLib} className=&quot;bg-indigo-600 text-w=

hite px-4 rounded-xl shadow-md&quot;&gt;&lt;Plus size={18}/&gt;&lt;/butto=

n&gt;</div>

<div style="font-family: Aptos, Aptos_MSFontService, -apple-system, Robot=

o, Arial, Helvetica, sans-serif; font-size: 12pt; color: rgb(33, 33, 33);" =

dir="auto">

&nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &lt;/div&gt;=

</div>

<div style="font-family: Aptos, Aptos_MSFontService, -apple-system, Robot=

o, Arial, Helvetica, sans-serif; font-size: 12pt; color: rgb(33, 33, 33);" =

dir="auto">

&nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp;&nbsp;</div>

<div style="font-family: Aptos, Aptos_MSFontService, -apple-system, Robot=

o, Arial, Helvetica, sans-serif; font-size: 12pt; color: rgb(33, 33, 33);" =

dir="auto">

&nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &lt;label cl=

assName=&quot;flex items-center justify-center gap-3 px-5 py-4 bg-emerald=

-50 text-emerald-600 rounded-2xl border border-dashed border-emerald-200 cu=

rsor-pointer&quot;&gt;</div>

<div style="font-family: Aptos, Aptos_MSFontService, -apple-system, Robot=

o, Arial, Helvetica, sans-serif; font-size: 12pt; color: rgb(33, 33, 33);" =

dir="auto">

&nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &lt;i=

nput type=&quot;file&quot; accept=&quot;.xlsx,.xls,.csv&quot; className=

=&quot;hidden&quot; onChange={handleExcelUpload} disabled={isImportin=

g} /&gt;</div>

<div style="font-family: Aptos, Aptos_MSFontService, -apple-system, Robot=

o, Arial, Helvetica, sans-serif; font-size: 12pt; color: rgb(33, 33, 33);" =

dir="auto">

&nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &lt;F=

ileUp size={18}/&gt;&lt;span className=&quot;text-[10px] font-black upp=

ercase&quot;&gt;{isImporting ? 'Processing...' : 'Bulk Upload'}&lt;/span&gt=

;</div>

<div style="font-family: Aptos, Aptos_MSFontService, -apple-system, Robot=

o, Arial, Helvetica, sans-serif; font-size: 12pt; color: rgb(33, 33, 33);" =

dir="auto">

&nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &lt;/label&g=

t;</div>

<div style="font-family: Aptos, Aptos_MSFontService, -apple-system, Robot=

o, Arial, Helvetica, sans-serif; font-size: 12pt; color: rgb(33, 33, 33);" =

dir="auto">

<br>

</div>

<div style="font-family: Aptos, Aptos_MSFontService, -apple-system, Robot=

o, Arial, Helvetica, sans-serif; font-size: 12pt; color: rgb(33, 33, 33);" =

dir="auto">

&nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &lt;div clas=

sName=&quot;space-y-2 pb-10&quot;&gt;</div>

<div style="font-family: Aptos, Aptos_MSFontService, -apple-system, Robot=

o, Arial, Helvetica, sans-serif; font-size: 12pt; color: rgb(33, 33, 33);" =

dir="auto">

&nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; {(dis=

hes || []).filter(d =&gt; d.categoryId === currentCategoryId).map(d=

ish =&gt; (</div>

<div style="font-family: Aptos, Aptos_MSFontService, -apple-system, Robot=

o, Arial, Helvetica, sans-serif; font-size: 12pt; color: rgb(33, 33, 33);" =

dir="auto">

&nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp=

; &lt;div key={dish.id} className=&quot;flex items-center justify-betwe=

en p-4 bg-slate-50 rounded-2xl border border-slate-100 shadow-sm&quot;&gt;<=

/div>

<div style="font-family: Aptos, Aptos_MSFontService, -apple-system, Robot=

o, Arial, Helvetica, sans-serif; font-size: 12pt; color: rgb(33, 33, 33);" =

dir="auto">

&nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp=

; &nbsp; &lt;span className=&quot;font-bold text-slate-700 text-xs break-=

words pr-2&quot;&gt;{dish.name}&lt;/span&gt;</div>

<div style="font-family: Aptos, Aptos_MSFontService, -apple-system, Robot=

o, Arial, Helvetica, sans-serif; font-size: 12pt; color: rgb(33, 33, 33);" =

dir="auto">

&nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp=

; &nbsp; &lt;div className=&quot;flex gap-2 flex-shrink-0&quot;&gt;</div>

<div style="font-family: Aptos, Aptos_MSFontService, -apple-system, Robot=

o, Arial, Helvetica, sans-serif; font-size: 12pt; color: rgb(33, 33, 33);" =

dir="auto">

&nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp=

; &nbsp; &nbsp; &lt;button onClick={() =&gt; deleteDoc(getHubRef('dishe=

s', dish.id))} className=&quot;text-slate-200 hover:text-rose-500 p-1&quo=

t;&gt;&lt;Trash2 size={14}/&gt;&lt;/button&gt;</div>

<div style="font-family: Aptos, Aptos_MSFontService, -apple-system, Robot=

o, Arial, Helvetica, sans-serif; font-size: 12pt; color: rgb(33, 33, 33);" =

dir="auto">

&nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp=

; &nbsp; &nbsp; {selectingFor &amp;&amp; &lt;button onClick={() =&gt; a=

ddDishToMeal(selectingFor.type, dish.name)} className=&quot;bg-indigo-600=

 text-white px-3 py-1.5 rounded-xl font-black text-[9px] uppercase tracking=

-widest&quot;&gt;ADD&lt;/button&gt;}</div>

<div style="font-family: Aptos, Aptos_MSFontService, -apple-system, Robot=

o, Arial, Helvetica, sans-serif; font-size: 12pt; color: rgb(33, 33, 33);" =

dir="auto">

&nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp=

; &nbsp; &lt;/div&gt;</div>

<div style="font-family: Aptos, Aptos_MSFontService, -apple-system, Robot=

o, Arial, Helvetica, sans-serif; font-size: 12pt; color: rgb(33, 33, 33);" =

dir="auto">

&nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp=

; &lt;/div&gt;</div>

<div style="font-family: Aptos, Aptos_MSFontService, -apple-system, Robot=

o, Arial, Helvetica, sans-serif; font-size: 12pt; color: rgb(33, 33, 33);" =

dir="auto">

&nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; ))}</=

div>

<div style="font-family: Aptos, Aptos_MSFontService, -apple-system, Robot=

o, Arial, Helvetica, sans-serif; font-size: 12pt; color: rgb(33, 33, 33);" =

dir="auto">

&nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &lt;/div&gt;=

</div>

<div style="font-family: Aptos, Aptos_MSFontService, -apple-system, Robot=

o, Arial, Helvetica, sans-serif; font-size: 12pt; color: rgb(33, 33, 33);" =

dir="auto">

&nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &lt;/div&gt;</div>

<div style="font-family: Aptos, Aptos_MSFontService, -apple-system, Robot=

o, Arial, Helvetica, sans-serif; font-size: 12pt; color: rgb(33, 33, 33);" =

dir="auto">

&nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; )}</div>

<div style="font-family: Aptos, Aptos_MSFontService, -apple-system, Robot=

o, Arial, Helvetica, sans-serif; font-size: 12pt; color: rgb(33, 33, 33);" =

dir="auto">

&nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &lt;/div&gt;</div>

<div style="font-family: Aptos, Aptos_MSFontService, -apple-system, Robot=

o, Arial, Helvetica, sans-serif; font-size: 12pt; color: rgb(33, 33, 33);" =

dir="auto">

&nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &lt;/div&gt;</div>

<div style="font-family: Aptos, Aptos_MSFontService, -apple-system, Robot=

o, Arial, Helvetica, sans-serif; font-size: 12pt; color: rgb(33, 33, 33);" =

dir="auto">

&nbsp; &nbsp; &nbsp; &nbsp; &lt;/div&gt;</div>

<div style="font-family: Aptos, Aptos_MSFontService, -apple-system, Robot=

o, Arial, Helvetica, sans-serif; font-size: 12pt; color: rgb(33, 33, 33);" =

dir="auto">

&nbsp; &nbsp; &nbsp; )}</div>

<div style="font-family: Aptos, Aptos_MSFontService, -apple-system, Robot=

o, Arial, Helvetica, sans-serif; font-size: 12pt; color: rgb(33, 33, 33);" =

dir="auto">

<br>

</div>

<div style="font-family: Aptos, Aptos_MSFontService, -apple-system, Robot=

o, Arial, Helvetica, sans-serif; font-size: 12pt; color: rgb(33, 33, 33);" =

dir="auto">

&nbsp; &nbsp; &nbsp; &lt;nav className=&quot;fixed bottom-0 left-0 right-=

0 bg-white/90 backdrop-blur-xl border-t border-slate-100 px-10 py-5 pb-9 fl=

ex justify-between items-center z-40 shadow-xl&quot;&gt;</div>

<div style="font-family: Aptos, Aptos_MSFontService, -apple-system, Robot=

o, Arial, Helvetica, sans-serif; font-size: 12pt; color: rgb(33, 33, 33);" =

dir="auto">

&nbsp; &nbsp; &nbsp; &nbsp; &lt;button onClick={() =&gt; setActiveTab('=

meals')} className={`flex flex-col items-center gap-1.5 transition-all ac=

tive:scale-90 ${activeTab === 'meals' ? 'text-indigo-600' : 'text-sla=

te-300'}`}&gt;</div>

<div style="font-family: Aptos, Aptos_MSFontService, -apple-system, Robot=

o, Arial, Helvetica, sans-serif; font-size: 12pt; color: rgb(33, 33, 33);" =

dir="auto">

&nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &lt;Utensils size={26} strokeWidth={=

2.5}/&gt;&lt;span className=&quot;text-[9px] font-black uppercase trackin=

g-tighter&quot;&gt;Meals&lt;/span&gt;</div>

<div style="font-family: Aptos, Aptos_MSFontService, -apple-system, Robot=

o, Arial, Helvetica, sans-serif; font-size: 12pt; color: rgb(33, 33, 33);" =

dir="auto">

&nbsp; &nbsp; &nbsp; &nbsp; &lt;/button&gt;</div>

<div style="font-family: Aptos, Aptos_MSFontService, -apple-system, Robot=

o, Arial, Helvetica, sans-serif; font-size: 12pt; color: rgb(33, 33, 33);" =

dir="auto">

&nbsp; &nbsp; &nbsp; &nbsp; &lt;button onClick={() =&gt; setActiveTab('=

groceries')} className={`flex flex-col items-center gap-1.5 transition-al=

l active:scale-90 ${activeTab === 'groceries' ? 'text-indigo-600' : '=

text-slate-300'}`}&gt;</div>

<div style="font-family: Aptos, Aptos_MSFontService, -apple-system, Robot=

o, Arial, Helvetica, sans-serif; font-size: 12pt; color: rgb(33, 33, 33);" =

dir="auto">

&nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &lt;ShoppingCart size={26} strokeWidth=

={2.5}/&gt;&lt;span className=&quot;text-[9px] font-black uppercase tra=

cking-tighter&quot;&gt;Grocery&lt;/span&gt;</div>

<div style="font-family: Aptos, Aptos_MSFontService, -apple-system, Robot=

o, Arial, Helvetica, sans-serif; font-size: 12pt; color: rgb(33, 33, 33);" =

dir="auto">

&nbsp; &nbsp; &nbsp; &nbsp; &lt;/button&gt;</div>

<div style="font-family: Aptos, Aptos_MSFontService, -apple-system, Robot=

o, Arial, Helvetica, sans-serif; font-size: 12pt; color: rgb(33, 33, 33);" =

dir="auto">

&nbsp; &nbsp; &nbsp; &nbsp; &lt;button onClick={() =&gt; setActiveTab('=

settings')} className={`flex flex-col items-center gap-1.5 transition-all=

 active:scale-90 ${activeTab === 'settings' ? 'text-indigo-600' : 'te=

xt-slate-300'}`}&gt;</div>

<div style="font-family: Aptos, Aptos_MSFontService, -apple-system, Robot=

o, Arial, Helvetica, sans-serif; font-size: 12pt; color: rgb(33, 33, 33);" =

dir="auto">

&nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &lt;Fingerprint size={26} strokeWidth=

={2.5}/&gt;&lt;span className=&quot;text-[9px] font-black uppercase tra=

cking-tighter&quot;&gt;Hub&lt;/span&gt;</div>

<div style="font-family: Aptos, Aptos_MSFontService, -apple-system, Robot=

o, Arial, Helvetica, sans-serif; font-size: 12pt; color: rgb(33, 33, 33);" =

dir="auto">

&nbsp; &nbsp; &nbsp; &nbsp; &lt;/button&gt;</div>

<div style="font-family: Aptos, Aptos_MSFontService, -apple-system, Robot=

o, Arial, Helvetica, sans-serif; font-size: 12pt; color: rgb(33, 33, 33);" =

dir="auto">

&nbsp; &nbsp; &nbsp; &lt;/nav&gt;</div>

<div style="font-family: Aptos, Aptos_MSFontService, -apple-system, Robot=

o, Arial, Helvetica, sans-serif; font-size: 12pt; color: rgb(33, 33, 33);" =

dir="auto">

&nbsp; &nbsp; &lt;/div&gt;</div>

<div style="font-family: Aptos, Aptos_MSFontService, -apple-system, Robot=

o, Arial, Helvetica, sans-serif; font-size: 12pt; color: rgb(33, 33, 33);" =

dir="auto">

&nbsp; );</div>

<div style="font-family: Aptos, Aptos_MSFontService, -apple-system, Robot=

o, Arial, Helvetica, sans-serif; font-size: 12pt; color: rgb(33, 33, 33);" =

dir="auto">

}</div>

<div style="font-family: Aptos, Aptos_MSFontService, -apple-system, Robot=

o, Arial, Helvetica, sans-serif; font-size: 12pt; color: rgb(33, 33, 33);" =

dir="auto">

<br>

</div>

<div style="font-family: Aptos, Aptos_MSFontService, -apple-system, Robot=

o, Arial, Helvetica, sans-serif; font-size: 12pt; color: rgb(33, 33, 33);" =

dir="auto">

```</div>

<div style="font-family: Aptos, Aptos_MSFontService, -apple-system, Robot=

o, Arial, Helvetica, sans-serif; font-size: 12pt; color: rgb(33, 33, 33);" =

dir="auto">

<br>

</div>

</body>

</html>



--_000_OSZPR01MB7745437877B45974CE3B9A55FC202OSZPR01MB7745jpnp_--

