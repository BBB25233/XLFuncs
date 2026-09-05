// Temporary computation of ok-case display strings using the same formulas as statistical-c.ts.
function fmt(v){ if(Number.isInteger(v)) return String(v); return String(Math.round(v*1e6)/1e6); }
function lngamma(x){
  const g=7, c=[0.99999999999980993,676.5203681218851,-1259.1392167224028,771.32342877765313,-176.61502916214059,12.507343278686905,-0.13857109526572012,9.9843695780195716e-6,1.5056327351493116e-7];
  if(x<0.5) return Math.log(Math.PI/Math.sin(Math.PI*x))-lngamma(1-x);
  x-=1; let a=c[0]; const t=x+g+0.5;
  for(let i=1;i<c.length;i++) a+=c[i]/(x+i);
  return Math.log(2*Math.PI)/2+(x+0.5)*Math.log(t)-t+Math.log(a);
}
function erf(x){ if(x===0) return 0; const ax=Math.abs(x); const p=(function lowerRegGamma(s,x){ if(x<0||s<=0) return NaN; if(x===0) return 0; if(x<s+1){ let ap=s,sum=1/s,del=sum; for(let n=1;n<300;n++){ap+=1;del*=x/ap;sum+=del;if(Math.abs(del)<Math.abs(sum)*1e-13)break;} return sum*Math.exp(-x+s*Math.log(x)-lngamma(s)); } return 1-(function(){let b=x+1-s,c=1/FPMIN(),d=1/b,h=d;for(let i=1;i<300;i++){const an=-i*(i-s);b+=2;d=an*d+b;if(Math.abs(d)<1e-300)d=1e-300;c=b+an/c;if(Math.abs(c)<1e-300)c=1e-300;d=1/d;const del=d*c;h*=del;if(Math.abs(del-1)<1e-13)break;}return Math.exp(-x+s*Math.log(x)-lngamma(s))*h;})();})(0.5,ax*ax); return x>=0?p:-p; }
const SQRT2=Math.SQRT2;
function comb(n,k){return Math.exp(lngamma(n+1)-lngamma(k+1)-lngamma(n-k+1));}
function binomPmf(k,n,p){return comb(n,k)*Math.pow(p,k)*Math.pow(1-p,n-k);}

// data
const avedev=[100,102,98,101,99];
const averagea=[85,0,72,0]; // text->0, number 0
const B=[10,20,30,40,50], C=[100,180,290,380,520];
const countblankBlank=1;
const devsq=[100,102,98,101,99];
const G=[1000,1500,2280,3400,5100], Gx=[1,2,3,4,5];
const geomean=[1.2,1.5,0.8];
const harmean=[30,60];
const kurt=[1000,1010,990,1005,995,1002,1500,980];
const large=[12000,8000,25000,15000];
const median=[8000,9500,12000,15000,80000];
const modemult=[10,20,10,20,30,30];
const modesngl=[2,3,3,1,3,2];

function meansd(x,y){
  const n=x.length; const mx=x.reduce((a,b)=>a+b,0)/n, my=y.reduce((a,b)=>a+b,0)/n;
  let cov=0,vx=0,vy=0; for(let i=0;i<n;i++){cov+=(x[i]-mx)*(y[i]-my);vx+=(x[i]-mx)**2;vy+=(y[i]-my)**2;}
  return {n,mx,my,cov,vx,vy};
}

const out={};
// avedev
{ const m=avedev.reduce((a,b)=>a+b,0)/avedev.length; const s=avedev.reduce((a,b)=>a+Math.abs(b-m),0); out.avedev=fmt(s/avedev.length); }
// averagea
{ out.averagea=fmt(averagea.reduce((a,b)=>a+b,0)/averagea.length); }
// binom-dist pmf
{ out.binom=fmt(binomPmf(4,10,0.3)); }
// correl/pearson
{ const r=meansd(B,C); out.correl=fmt(r.cov/Math.sqrt(r.vx*r.vy)); out.pearson=out.correl; }
// countblank
{ out.countblank=fmt(countblankBlank); }
// covariance
{ const r=meansd(B,C); out.covp=fmt(r.cov/r.n); out.covs=fmt(r.cov/(r.n-1)); }
// devsq
{ const m=devsq.reduce((a,b)=>a+b,0)/devsq.length; out.devsq=fmt(devsq.reduce((a,b)=>a+(b-m)**2,0)); }
// forecast-linear x=60
{ const r=meansd(B,C); const slope=r.cov/r.vx; const intercept=r.my-slope*r.mx; out.forecast=fmt(intercept+slope*60); }
// frequency
{ const data=[55,68,72,85,90,93,78,61,88,95]; const bins=[60,80,100]; const counts=[]; let lower=-Infinity; for(const b of bins){let c=0;for(const v of data)if(v>lower&&v<=b)c++;counts.push(c);lower=b;} let over=0;for(const v of data)if(v>lower)over++;counts.push(over); out.frequency=counts.join(';'); }
// geomean
{ const lm=geomean.reduce((a,b)=>a+Math.log(b),0)/geomean.length; out.geomean=fmt(Math.exp(lm)); }
// growth new_x=6
{ const lnY=G.map(Math.log); const n=G.length; const mx=Gx.reduce((a,b)=>a+b,0)/n, my=lnY.reduce((a,b)=>a+b,0)/n; let cov=0,vx=0; for(let i=0;i<n;i++){cov+=(Gx[i]-mx)*(lnY[i]-my);vx+=(Gx[i]-mx)**2;} const slope=cov/vx, intercept=my-slope*mx; out.growth=fmt(Math.exp(intercept+slope*6)); out.logest=fmt(Math.exp(slope)); }
// harmean
{ out.harmean=fmt(harmean.length/harmean.reduce((a,b)=>a+1/b,0)); }
// intercept
{ const r=meansd(B,C); const slope=r.cov/r.vx; out.intercept=fmt(r.my-slope*r.mx); }
// kurt
{ const n=kurt.length; const m=kurt.reduce((a,b)=>a+b,0)/n; let s2=0,s4=0; for(const v of kurt){const d=v-m;s2+=d*d;s4+=d*d*d*d;} const sv=s2/(n-1); const m4=s4/n; out.kurt=fmt((n*(n+1)/((n-1)*(n-2)*(n-3)))*(m4/(sv*sv))-(3*(n-1)*(n-1)/((n-2)*(n-3)))); }
// large k=2
{ const s=large.slice().sort((a,b)=>b-a); out.large=fmt(s[1]); }
// linest slope
{ const r=meansd(B,C); out.linest=fmt(r.cov/r.vx); }
// median
{ const s=median.slice().sort((a,b)=>a-b); const mid=Math.floor(s.length/2); out.median=fmt(s.length%2? s[mid]:(s[mid-1]+s[mid])/2); }
// mode-mult
{ const f=new Map(); for(const v of modemult)f.set(v,(f.get(v)||0)+1); let mf=0; for(const c of f.values())mf=Math.max(mf,c); const modes=[...f.entries()].filter(([,c])=>c===mf).map(([v])=>v).sort((a,b)=>a-b); out.modemult=modes.join(';'); }
// mode-sngl
{ const f=new Map(); for(const v of modesngl)f.set(v,(f.get(v)||0)+1); let mf=0; for(const c of f.values())mf=Math.max(mf,c); let mode=NaN; for(const [v,c] of f)if(c===mf){mode=v;break;} out.modesngl=fmt(mode); }
// norm-dist cumulative
{ out.normdist=fmt(0.5*(1+erf((115-100)/(15*SQRT2)))); }
// norm-s-dist z=1
{ out.normsdist=fmt(0.5*(1+erf(1/SQRT2))); }

console.log(JSON.stringify(out,null,2));
