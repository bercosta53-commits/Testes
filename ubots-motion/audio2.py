import numpy as np, json
from scipy.signal import butter, sosfilt, fftconvolve
from scipy.io import wavfile
SR=44100; N=SR*20
rng=np.random.default_rng(7)
dry=np.zeros((2,N)); wet=np.zeros((2,N)); mus=np.zeros((2,N)); duck=np.ones(N)
T=lambda n: np.arange(n)/SR
def F(x,f,kind='low',o=2): return sosfilt(butter(o,f,kind,fs=SR,output='sos'),x)
def place(buf,sig,t0,g=1.,pan=0.):
    i=int(round(t0*SR)); j=0
    if i<0: j=-i; i=0
    if i>=N: return
    s=sig[j:j+N-i]*g; a=(np.clip(pan,-1,1)+1)*np.pi/4
    buf[0,i:i+len(s)]+=s*np.cos(a)*1.414; buf[1,i:i+len(s)]+=s*np.sin(a)*1.414
def sfx(sig,t0,g=1.,pan=0.,rv=0.25):
    place(dry,sig,t0,g,pan); place(wet,sig,t0,g*rv,pan)
def note(m): return 440*2**((m-69)/12)
def sweep_bp(x,f0,f1,q=0.6):
    n=len(x); out=np.zeros(n); b=512; fs=np.geomspace(f0,f1,n)
    for i in range(0,n,b):
        f=fs[i]; out[i:i+b]=F(x[i:i+b],[max(f*(1-q/2),40),min(f*(1+q/2),20000)],'band',1)
    return out
# ---------- instruments ----------
def kick(g=1.):
    n=int(.5*SR); t=T(n); f=45+130*np.exp(-t*28); s=np.sin(2*np.pi*np.cumsum(f)/SR)*np.exp(-t*6.5)
    return np.tanh((s+0.25*np.exp(-t*300)*rng.standard_normal(n))*1.6)*g
def clap(g=1.):
    n=int(.3*SR); t=T(n); x=F(rng.standard_normal(n),[900,6000],'band'); e=np.exp(-t*18)
    for k in (0.008,0.017,0.026): e=e+0.7*np.exp(-np.maximum(t-k,0)*120)*(t>=k)
    return x*e*0.45*g
def hat(g=1.,d=35,open_=False):
    n=int((.35 if open_ else .09)*SR); t=T(n); return F(rng.standard_normal(n),7500,'high')*np.exp(-t*(8 if open_ else d))*0.3*g
def crash(g=1.):
    n=int(2.5*SR); t=T(n); x=F(rng.standard_normal(n),3500,'high'); return x*np.exp(-t*1.6)*0.35*g
def whoosh(d,f0,f1,g=1.,shape=2.):
    n=int(d*SR); t=T(n); x=sweep_bp(rng.standard_normal(n),f0,f1); e=np.sin(np.pi*np.clip(t/d,0,1))**shape
    return x*e*g
def pan_sweep(sig,t0,p0,p1,g=1.,rv=.3):
    n=len(sig); p=np.linspace(p0,p1,n); a=(p+1)*np.pi/4; i=int(t0*SR); m=min(n,N-i)
    for buf,k in ((dry,1.),(wet,rv)):
        buf[0,i:i+m]+=sig[:m]*np.cos(a[:m])*1.414*g*k; buf[1,i:i+m]+=sig[:m]*np.sin(a[:m])*1.414*g*k
def bell(m,d=1.5,g=1.):
    n=int(d*SR); t=T(n); f=note(m); s=0
    for k,a,dd in ((1,1,1.),(2.0,.4,.55),(2.76,.22,.35),(4.07,.12,.22),(5.4,.06,.15)): s=s+a*np.sin(2*np.pi*f*k*t)*np.exp(-t/(dd*d*0.6))
    return s*np.minimum(t/0.002,1)*0.22*g
def plink(m,g=1.):
    n=int(.9*SR); t=T(n); f=note(m); s=np.sin(2*np.pi*f*t)*np.exp(-t*7)+0.5*np.sin(2*np.pi*f*2.01*t)*np.exp(-t*12)+0.25*np.sin(2*np.pi*f*3.02*t)*np.exp(-t*20)
    return s*np.minimum(t/0.001,1)*0.25*g
def pop(f0,g=1.):
    n=int(.16*SR); t=T(n); f=f0*(0.5+0.5*np.exp(-t*45)); s=np.sin(2*np.pi*np.cumsum(f)/SR)*np.exp(-t*28)
    return (s+0.12*np.exp(-t*500)*rng.standard_normal(n))*0.4*g
def sub_boom(g=1.,d=2.2):
    n=int(d*SR); t=T(n); f=38+80*np.exp(-t*10); return np.sin(2*np.pi*np.cumsum(f)/SR)*np.exp(-t*1.8)*g
def crack(g=1.):
    n=int(.12*SR); t=T(n); return F(rng.standard_normal(n),1800,'high')*np.exp(-t*60)*0.8*g
def impact(t0,g=1.,big=False):
    sfx(sub_boom(1.0,2.6 if big else 2.0),t0,0.9*g,0,0.1)
    sfx(kick(1.),t0,0.8*g,0,0.2); sfx(crack(),t0,0.6*g,0,0.6)
    sfx(crash(),t0,0.55*g,0,0.5)
    for m in ((57,64,69,73,76) if big else (57,64,69)): sfx(bell(m+12,2.5),t0,0.35*g,rng.uniform(-.4,.4),0.8)
def rev_swell(t0,t1,g=1.):
    n=int((t1-t0)*SR); t=T(n); p=t/(t1-t0); x=F(rng.standard_normal(n),2500,'high')*(p**3)
    return x*g
def riser(t0,t1,g=1.):
    n=int((t1-t0)*SR); t=T(n); p=t/(t1-t0); s=0
    for o in (0,12,24):   # shepard-ish stack
        f=110*2**((o+p*14)/12); s=s+np.sin(2*np.pi*np.cumsum(np.full(n,f) if np.isscalar(f) else f)/SR)*np.sin(np.pi*np.clip((o/12+p)/3,0,1))
    nz=F(rng.standard_normal(n),3000,'high')*0.6
    return (s*0.18+nz*0.25)*p**2*g
def tick(f,g=1.):
    n=int(.04*SR); t=T(n); return (np.sin(2*np.pi*f*t)*np.exp(-t*180)+0.4*F(rng.standard_normal(n),4000,'high')*np.exp(-t*400))*0.22*g
def thud(f=55,g=1.):
    n=int(.5*SR); t=T(n); s=np.sin(2*np.pi*np.cumsum(f*(1+np.exp(-t*25)))/SR)*np.exp(-t*9)
    return (s+F(rng.standard_normal(n),500)*np.exp(-t*14)*0.8)*g
def whump(g=1.):
    n=int(.18*SR); t=T(n); return F(rng.standard_normal(n),[150,700],'band')*np.exp(-t*22)*np.minimum(t/0.01,1)*1.2*g
# ---------- music ----------
CH={'Am':[57,60,64,71],'F':[53,57,60,64],'C':[48,55,60,64],'G':[55,59,62,67],'Em':[52,55,59,64]}
ROOT={'Am':33,'F':29,'C':36,'G':31,'Em':28}
def pad_chord(c,d,bright=1400,g=1.):
    n=int(d*SR); t=T(n); s=0
    for m in CH[c]:
        for det in (-0.07,0,0.07): f=note(m+det); s=s+(2*((f*t+rng.random())%1)-1)
    s=F(s,bright)/12; e=np.minimum(t/0.35,1)*np.minimum((d-t)/0.4,1)
    return s*np.clip(e,0,1)*g
def bass_note(m,d=.22):
    n=int(d*SR); t=T(n); f=note(m); s=np.tanh(2.2*F(2*((f*t)%1)-1,420))*np.exp(-t*5)*np.minimum(t/0.004,1)
    return s+0.6*np.sin(2*np.pi*f*t)*np.exp(-t*4)
def pluck(m,g=1.):
    n=int(.5*SR); t=T(n); f=note(m); s=F(2*((f*t)%1)-1,2200)*np.exp(-t*9)
    return s*0.18*g
def kicks(t0): place(mus,kick(),t0,0.85); 
    
def duckat(t0,depth=0.55,rel=0.16):
    i=int(t0*SR); n=min(int(0.6*SR),N-i); 
    if n<=0: return
    duck[i:i+n]=np.minimum(duck[i:i+n],1-depth*np.exp(-T(n)/rel))
# intro drone 0-4.35
n=int(4.6*SR); t=T(n)
drone=(np.sin(2*np.pi*55*t)+0.5*np.sin(2*np.pi*82.5*t+np.sin(t*0.7)))*np.minimum(t/1.2,1)*0.18
place(mus,drone,0,1.)
intro=np.concatenate([pad_chord('Am',2.3,600),pad_chord('F',2.3,900)])
# filter-opening intro pad
place(mus,intro,0.05,0.55)
for k in range(8): place(mus,hat(d=70),0.35+k*0.5,0.18,0.3)
# groove A: 4.35 - 11.85
B=0.5; prog=['Am','F','C','G']
for bi in range(4):
    t0=4.35+bi*2.0; c=prog[bi%4]
    place(mus,pad_chord(c,2.4,1500),t0,0.5,0)
    for k in range(4):
        tb=t0+k*B
        if tb>=11.85: break
        place(mus,kick(),tb,0.8); duckat(tb)
        if k%2==1: place(mus,clap(),tb,0.6,0.05)
        place(mus,hat(),tb+0.25,0.5,0.35); place(mus,hat(d=60),tb+0.125,0.18,-0.3); place(mus,hat(d=60),tb+0.375,0.18,-0.3)
        for e in range(2):
            te=tb+e*0.25
            if te<11.6: place(mus,bass_note(ROOT[c]+(12 if (k*2+e)%4==3 else 0)),te,0.55)
# snare roll + riser into whip
for k in range(24):
    tr=10.85+k*(1.0/24); place(mus,clap(),tr,0.08+0.45*(k/24)**2,0)
sfx(riser(10.85,11.95),10.85,0.9,0,0.3)
# groove B: 12.45 - 15.75 (drop)
progB=['Am','F','C','G']
for bi in range(2):
    t0=12.45+bi*2.0; c=progB[bi*2] if bi==0 else 'C'
    place(mus,pad_chord(c,2.4,2600),t0,0.55)
    for k in range(4):
        tb=t0+k*B
        if tb>=15.75: break
        place(mus,kick(),tb,0.9); duckat(tb,0.65)
        if k%2==1: place(mus,clap(),tb,0.7,0.05)
        for h in range(4): place(mus,hat(d=45),tb+h*0.125,0.42 if h%2 else 0.22,0.35)
        for e in range(4):
            te=tb+e*0.125
            if te<15.7: place(mus,bass_note(ROOT[c]+(12 if e==2 else 0),0.12),te,0.5)
        for e,m in enumerate(CH[c]): place(mus,pluck(m+12),tb+e*0.125,0.9,(-1)**e*0.4)
place(mus,pad_chord('G',1.4,2600),15.0,0.0)
# end section: 16.45 - 20
place(mus,pad_chord('F',1.8,3000),16.45,0.6); place(mus,pad_chord('C',2.0,3000),18.2,0.65)
for k in range(7):
    tb=16.45+k*0.5
    if k%2==0: place(mus,kick(),tb,0.55); duckat(tb,0.4)
    place(mus,hat(d=55),tb+0.25,0.3,0.35)
    place(mus,bass_note(ROOT['F' if tb<18.2 else 'C']),tb,0.4)
for k,m in enumerate([72,76,79,84,79,76,72,76]): place(mus,pluck(m),16.5+k*0.25,0.6,(-1)**k*0.5)
# ---------- SFX ----------
ev=json.load(open('events.json'))
for i in range(8): sfx(tick(3200,0.6),0.35+i*0.1+0.08,0.5,(-1)**i*0.2,0.3)        # word flips
for p in ev['pops']:
    g=1/(1+p['dist']/10); sfx(pop(rng.uniform(650,1250)),p['t'],0.9*g,p['pan']*0.8,0.35)
for f in ev['flyby']:
    w=whoosh(0.55,2500,500,1.,1.5); g=1.5/(1+f['r']/3)
    pan_sweep(w,f['t']-0.3,f['pan']*0.4,f['pan'],g,0.15)
# vortex swirl
n=int(1.3*SR); t=T(n); sw=sweep_bp(rng.standard_normal(n),400,5000,0.4)*np.minimum(t/1.0,1)**2
ph=np.cumsum(2*np.pi*(1+t*6)/SR); a=(np.sin(ph)+1)*np.pi/4; i0=int(3.05*SR)
for buf,k in ((dry,0.8),(wet,0.3)): buf[0,i0:i0+n]+=sw*np.cos(a)*k*1.2; buf[1,i0:i0+n]+=sw*np.sin(a)*k*1.2
sfx(rev_swell(3.3,4.35),3.3,0.55,0,0.3)
sfx(riser(3.1,4.35),3.1,0.6,0,0.3)
impact(4.35,1.0)
sfx(whoosh(0.5,800,3500,1.),4.62,0.5,0.4,0.3)                       # "dias" slide
pan_sweep(whoosh(1.0,3000,300,1.),6.55,0,0,0.7,0.3)                  # crane down / 32 lifts
n=int(.45*SR); t=T(n); sfx(np.sin(2*np.pi*np.cumsum(1400-900*t/.45)/SR)*np.minimum(t/.3,1)*0.08,7.1,1,0,0.2)  # fall whistle
sfx(thud(52),7.55,1.0,0,0.25); sfx(crash(0.3),7.55,0.25,0,0.3)
n=int(1.0*SR); t=T(n); sfx(F(rng.standard_normal(n),[1500,6000],'band')*np.exp(-t*3.5)*0.25,7.58,1,0,0.2)   # dust
for k,p in enumerate([-0.5,0.5,-0.2,0.2]): sfx(whump(),8.0+k*0.06,0.8,p,0.3)
n=int(3.5*SR); t=T(n); sh=0
for m in (76,79,83,88): sh=sh+np.sin(2*np.pi*note(m)*t+0.003*np.sin(2*np.pi*5*t)*m)
sh=sh*np.minimum(t/0.5,1)*np.exp(-np.maximum(t-1.5,0)*1.2)*0.05; sfx(sh,8.05,1,0,0.7)       # beam shimmer
sfx(whoosh(0.6,600,4000,1.),8.0,0.4,0,0.3)
for i,m in enumerate([84,88,91,96]):
    tt=8.6+i*0.45; pn=[-0.4,0.4,-0.25,0.25][i]
    sfx(plink(m),tt+0.08,0.9,pn,0.55); sfx(whoosh(0.35,900,4000,1.),tt,0.35,pn,0.2)
pan_sweep(whoosh(0.75,400,6000,1.,1.5),11.75,-0.6,0.6,1.0,0.3)          # whip up
impact(12.45,0.55)
# counter ticks
def cnt(t): x=np.clip((t-12.5)/2.1,0,1); return np.round(103*(1-(1-x)**3))
last=-1; lt=-1
for t0 in np.arange(12.5,14.61,1/1000):
    c=cnt(t0)
    if c!=last and t0-lt>0.04: sfx(tick(1500+c*14),t0,0.9,rng.uniform(-.25,.25),0.15); lt=t0
    last=c
sfx(riser(12.6,14.6)*0.6,12.6,0.6,0,0.2)
impact(14.6,1.25,True)
pan_sweep(whoosh(1.1,6000,200,1.,1.2),14.62,0,0,0.6,0.5)                 # shockwave
for k in range(22): sfx(bell(int(rng.choice([84,88,91,96,100])),0.6),14.62+rng.uniform(0,0.9),0.25,rng.uniform(-.8,.8),0.6)
pan_sweep(whoosh(0.7,5000,300,1.,1.5),15.72,0.5,-0.5,0.9,0.3)            # whip down
sfx(rev_swell(15.8,16.45),15.8,0.5,0,0.4)
n=int(3*SR); t=T(n); bl=0
for m in (60,64,67,72,76): bl=bl+np.sin(2*np.pi*note(m)*t)*(1+0.3*np.sin(2*np.pi*0.7*t))
sfx(bl*np.minimum(t/0.25,1)*np.exp(-t*0.9)*0.045,16.45,1,0,0.8)             # airy bloom
for i in range(4): sfx(thud(140+i*20,0.35),16.95+i*0.13,0.6,[-0.5,0.5,-0.4,0.4][i],0.2); sfx(tick(2600),16.95+i*0.13,0.4,0,0.2)
sfx(pop(900),17.3,0.6,0,0.3)
for m,d in ((84,0),(88,0.07),(91,0.14),(96,0.21)): sfx(bell(m,2.2),18.2+d,0.7,0.15,0.6)
sfx(tick(2200,1.2),18.2,0.6,0,0.1)
for m,d in ((91,0),(96,0.07)): sfx(bell(m,1.8),19.2+d,0.45,-0.15,0.6)
# ---------- mix ----------
mus*=duck
L=int(2.6*SR); t=T(L); irs=[]
for ch in range(2):
    x=rng.standard_normal(L)*np.exp(-t*2.7); x=F(x,5000)
    irs.append(x/np.sqrt(np.sum(x**2)))
send=wet+0.18*mus
rev=np.stack([fftconvolve(send[c],irs[c])[:N] for c in range(2)])
mix=dry+mus*0.9+rev*0.9
mix=np.stack([F(mix[c],28,'high') for c in range(2)])
# bus compressor
env=np.sqrt(F(np.mean(mix**2,0),8)+1e-9); thr=np.percentile(env,90)*0.7
g=np.minimum(1,(thr/env)**(1-1/2.5)); g=F(g,15)
mix*=g
mix=np.tanh(mix/np.max(np.abs(mix))*1.8)
f=np.ones(N); k=int(0.45*SR); f[-k:]=np.linspace(1,0,k)**1.5; mix*=f
mix/=np.max(np.abs(mix))/0.891
wavfile.write('audio2.wav',SR,(mix.T*32767).astype(np.int16)); print('ok', 20*np.log10(np.sqrt(np.mean(mix**2))))
