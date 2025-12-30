import React, { useState, useEffect } from 'react';
import { 
  Zap, Shield, Brain, Music, Eye, Database, Wrench, Menu, X,
  Activity, AlertTriangle, CheckCircle, TrendingUp, TrendingDown,
  Battery, Cpu, Wifi, Sun, Thermometer, Wind, Radio,
  MessageCircle, Send, ChevronRight, ExternalLink, Github,
  Play, Pause, RotateCcw, Settings, Info, HelpCircle
} from 'lucide-react';

// ============================================
// TYPES
// ============================================
interface GridNode {
  id: string;
  name: string;
  region: string;
  load: number;
  capacity: number;
  status: 'stable' | 'warning' | 'critical';
  trend: 'up' | 'down' | 'stable';
}

interface ForgeConfig {
  vehicleType: 'van' | 'truck' | 'trailer' | 'stationary';
  tegUnits: number;
  solarWatts: number;
  batteryKwh: number;
  meshNodes: number;
  computeUnits: number;
}

interface ChatMessage {
  role: 'user' | 'maggie';
  content: string;
  timestamp: Date;
}

// ============================================
// NAVIGATION
// ============================================
const Navigation: React.FC<{ currentPage: string; setCurrentPage: (page: string) => void }> = ({ currentPage, setCurrentPage }) => {
  const [isOpen, setIsOpen] = useState(false);
  
  const navItems = [
    { id: 'home', label: 'Home', icon: Zap },
    { id: 'fearbox', label: 'Fear Box', icon: AlertTriangle },
    { id: 'forge', label: 'Oasis Forge', icon: Wrench },
    { id: 'maggie', label: 'Maggie.ai', icon: Brain },
    { id: 'modules', label: 'Modules', icon: Database },
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 glass border-b border-quantum-cyan/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-3 cursor-pointer" onClick={() => setCurrentPage('home')}>
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-quantum-cyan to-quantum-teal flex items-center justify-center">
              <Zap className="w-6 h-6 text-oasis-deep" />
            </div>
            <span className="font-display font-bold text-xl tracking-wider text-gradient">QUANTUM OASIS</span>
          </div>
          
          <div className="hidden md:flex items-center space-x-1">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setCurrentPage(item.id)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-300 ${
                  currentPage === item.id 
                    ? 'bg-quantum-cyan/20 text-quantum-cyan border border-quantum-cyan/30' 
                    : 'text-oasis-muted hover:text-oasis-light hover:bg-oasis-steel/50'
                }`}
              >
                <item.icon className="w-4 h-4" />
                <span className="font-medium">{item.label}</span>
              </button>
            ))}
          </div>

          <button className="md:hidden p-2" onClick={() => setIsOpen(!isOpen)}>
            {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {isOpen && (
        <div className="md:hidden glass border-t border-quantum-cyan/20">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => { setCurrentPage(item.id); setIsOpen(false); }}
              className={`w-full flex items-center space-x-3 px-6 py-4 ${
                currentPage === item.id ? 'bg-quantum-cyan/20 text-quantum-cyan' : 'text-oasis-muted'
              }`}
            >
              <item.icon className="w-5 h-5" />
              <span>{item.label}</span>
            </button>
          ))}
        </div>
      )}
    </nav>
  );
};

// ============================================
// HOME PAGE
// ============================================
const HomePage: React.FC<{ setCurrentPage: (page: string) => void }> = ({ setCurrentPage }) => {
  return (
    <div className="min-h-screen pt-16">
      {/* Hero Section */}
      <section className="relative min-h-[90vh] flex items-center justify-center grid-bg overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-oasis-deep/50 to-oasis-deep" />
        
        {/* Floating orbs */}
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-quantum-cyan/10 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-quantum-teal/10 rounded-full blur-3xl animate-float" style={{ animationDelay: '-3s' }} />
        
        <div className="relative z-10 text-center px-4 max-w-5xl">
          <h1 className="font-display text-5xl md:text-7xl lg:text-8xl font-black mb-6 tracking-tight">
            <span className="text-gradient animate-glow">SOVEREIGNTY</span>
            <br />
            <span className="text-oasis-bright">THROUGH INFRASTRUCTURE</span>
          </h1>
          
          <p className="text-xl md:text-2xl text-oasis-muted mb-8 max-w-3xl mx-auto font-light">
            Universal Basic Ownership — not dependency. Own your power. Own your data. Own your future.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12">
            <button 
              onClick={() => setCurrentPage('forge')}
              className="group px-8 py-4 bg-gradient-to-r from-quantum-cyan to-quantum-teal text-oasis-deep font-bold rounded-lg transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-quantum-cyan/30 flex items-center space-x-2"
            >
              <Wrench className="w-5 h-5" />
              <span>Build Your Oasis</span>
              <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
            <button 
              onClick={() => setCurrentPage('fearbox')}
              className="px-8 py-4 border border-quantum-crimson/50 text-quantum-crimson font-bold rounded-lg transition-all duration-300 hover:bg-quantum-crimson/10 hover:border-quantum-crimson flex items-center space-x-2"
            >
              <AlertTriangle className="w-5 h-5" />
              <span>See The Crisis</span>
            </button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
            {[
              { value: '92', unit: 'GW', label: 'Power Gap' },
              { value: '$717', unit: 'B', label: 'Annual Savings vs UBI' },
              { value: '8', unit: '', label: 'Open Source Repos' },
              { value: '3', unit: '', label: 'USPTO Patents Pending' },
            ].map((stat, i) => (
              <div key={i} className="glass rounded-xl p-4 glow-border">
                <div className="font-display text-3xl md:text-4xl font-bold text-quantum-cyan">
                  {stat.value}<span className="text-quantum-teal text-xl">{stat.unit}</span>
                </div>
                <div className="text-oasis-muted text-sm">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Sovereignty Stack */}
      <section className="py-24 px-4">
        <div className="max-w-6xl mx-auto">
          <h2 className="font-display text-4xl md:text-5xl font-bold text-center mb-4">
            THE <span className="text-gradient">SOVEREIGNTY STACK</span>
          </h2>
          <p className="text-center text-oasis-muted mb-16 max-w-2xl mx-auto">
            A modular operating system where you add only what you need. No bloatware. No forced dependencies.
          </p>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { icon: Zap, title: 'Energy Sovereignty', desc: 'Generate power from waste heat, vibration, solar. Never depend on the grid.', color: 'quantum-cyan' },
              { icon: Database, title: 'Data Sovereignty', desc: 'Train AI locally. Your data never leaves your node.', color: 'quantum-teal' },
              { icon: Eye, title: 'Information Sovereignty', desc: 'Research without gatekeepers. Connect dots freely.', color: 'quantum-violet' },
              { icon: Music, title: 'Creative Sovereignty', desc: 'Artists own their work. No extraction. No middlemen.', color: 'quantum-gold' },
              { icon: Brain, title: 'Therapeutic Sovereignty', desc: 'Communication tools for everyone. Voice for the voiceless.', color: 'quantum-amber' },
              { icon: Shield, title: 'Economic Sovereignty', desc: 'Infrastructure you own generates income 24/7.', color: 'quantum-crimson' },
            ].map((item, i) => (
              <div key={i} className="group glass rounded-2xl p-6 glow-border hover:scale-105 transition-all duration-300 cursor-pointer">
                <div className={`w-14 h-14 rounded-xl bg-${item.color}/20 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                  <item.icon className={`w-7 h-7 text-${item.color}`} />
                </div>
                <h3 className="font-display text-xl font-bold mb-2">{item.title}</h3>
                <p className="text-oasis-muted">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* UBO vs UBI */}
      <section className="py-24 px-4 bg-gradient-to-b from-oasis-deep to-oasis-dark">
        <div className="max-w-6xl mx-auto">
          <h2 className="font-display text-4xl md:text-5xl font-bold text-center mb-16">
            <span className="text-quantum-teal">OWNERSHIP</span> vs <span className="text-quantum-crimson">DEPENDENCY</span>
          </h2>

          <div className="grid md:grid-cols-2 gap-8">
            <div className="glass rounded-2xl p-8 border-2 border-quantum-crimson/30">
              <h3 className="font-display text-2xl font-bold text-quantum-crimson mb-4">Universal Basic Income</h3>
              <ul className="space-y-3 text-oasis-muted">
                <li className="flex items-start space-x-3">
                  <X className="w-5 h-5 text-quantum-crimson mt-0.5 flex-shrink-0" />
                  <span>Government checks forever — permanent dependency</span>
                </li>
                <li className="flex items-start space-x-3">
                  <X className="w-5 h-5 text-quantum-crimson mt-0.5 flex-shrink-0" />
                  <span>$700+ billion per year cost</span>
                </li>
                <li className="flex items-start space-x-3">
                  <X className="w-5 h-5 text-quantum-crimson mt-0.5 flex-shrink-0" />
                  <span>No asset building, no wealth transfer</span>
                </li>
                <li className="flex items-start space-x-3">
                  <X className="w-5 h-5 text-quantum-crimson mt-0.5 flex-shrink-0" />
                  <span>Vulnerable to political changes</span>
                </li>
              </ul>
            </div>

            <div className="glass rounded-2xl p-8 border-2 border-quantum-teal/30 glow-border">
              <h3 className="font-display text-2xl font-bold text-quantum-teal mb-4">Universal Basic Ownership</h3>
              <ul className="space-y-3 text-oasis-muted">
                <li className="flex items-start space-x-3">
                  <CheckCircle className="w-5 h-5 text-quantum-teal mt-0.5 flex-shrink-0" />
                  <span>Own infrastructure that generates income 24/7</span>
                </li>
                <li className="flex items-start space-x-3">
                  <CheckCircle className="w-5 h-5 text-quantum-teal mt-0.5 flex-shrink-0" />
                  <span>$717 billion annual savings vs UBI</span>
                </li>
                <li className="flex items-start space-x-3">
                  <CheckCircle className="w-5 h-5 text-quantum-teal mt-0.5 flex-shrink-0" />
                  <span>Build generational wealth through assets</span>
                </li>
                <li className="flex items-start space-x-3">
                  <CheckCircle className="w-5 h-5 text-quantum-teal mt-0.5 flex-shrink-0" />
                  <span>Sovereignty — you control your infrastructure</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="font-display text-4xl md:text-5xl font-bold mb-6">
            Ready to Build Your <span className="text-gradient">Oasis</span>?
          </h2>
          <p className="text-xl text-oasis-muted mb-8">
            Configure your personal sovereignty node. See the cost. See the potential.
          </p>
          <button 
            onClick={() => setCurrentPage('forge')}
            className="px-12 py-5 bg-gradient-to-r from-quantum-cyan to-quantum-teal text-oasis-deep font-bold text-xl rounded-xl transition-all duration-300 hover:scale-105 hover:shadow-xl hover:shadow-quantum-cyan/30"
          >
            Open The Forge
          </button>
        </div>
      </section>
    </div>
  );
};

// ============================================
// FEAR BOX - Grid Collapse Visualization
// ============================================
const FearBoxPage: React.FC = () => {
  const [gridNodes, setGridNodes] = useState<GridNode[]>([]);
  const [isRunning, setIsRunning] = useState(true);
  const [totalLoad, setTotalLoad] = useState(0);
  const [totalCapacity, setTotalCapacity] = useState(0);

  useEffect(() => {
    // Initialize grid nodes
    const regions = [
      'Northeast', 'Southeast', 'Midwest', 'Southwest', 'West Coast', 
      'Texas', 'Florida', 'California', 'New York', 'Ohio'
    ];
    
    const initialNodes: GridNode[] = regions.map((region, i) => ({
      id: `node-${i}`,
      name: `${region} Grid`,
      region,
      load: 70 + Math.random() * 20,
      capacity: 100,
      status: 'stable',
      trend: 'stable'
    }));
    
    setGridNodes(initialNodes);
  }, []);

  useEffect(() => {
    if (!isRunning) return;

    const interval = setInterval(() => {
      setGridNodes(prev => prev.map(node => {
        // Simulate increasing demand (AI data centers coming online)
        const demandIncrease = Math.random() * 2;
        const fluctuation = (Math.random() - 0.4) * 3;
        let newLoad = Math.min(120, Math.max(50, node.load + demandIncrease + fluctuation));
        
        let status: 'stable' | 'warning' | 'critical' = 'stable';
        if (newLoad > 95) status = 'critical';
        else if (newLoad > 85) status = 'warning';

        const trend = newLoad > node.load ? 'up' : newLoad < node.load ? 'down' : 'stable';

        return { ...node, load: newLoad, status, trend };
      }));
    }, 1000);

    return () => clearInterval(interval);
  }, [isRunning]);

  useEffect(() => {
    const load = gridNodes.reduce((sum, n) => sum + n.load, 0);
    const cap = gridNodes.reduce((sum, n) => sum + n.capacity, 0);
    setTotalLoad(load);
    setTotalCapacity(cap);
  }, [gridNodes]);

  const criticalCount = gridNodes.filter(n => n.status === 'critical').length;
  const warningCount = gridNodes.filter(n => n.status === 'warning').length;
  const overallStatus = criticalCount > 2 ? 'critical' : criticalCount > 0 || warningCount > 3 ? 'warning' : 'stable';

  return (
    <div className="min-h-screen pt-20 px-4 pb-12">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="font-display text-4xl md:text-5xl font-bold mb-4">
            <span className="text-quantum-crimson">FEAR BOX</span>
            <span className="text-oasis-muted text-2xl md:text-3xl block mt-2">Real-Time Grid Stress Monitor</span>
          </h1>
          <p className="text-oasis-muted max-w-2xl mx-auto">
            Watch as AI datacenter demand pushes the grid toward collapse. 
            Eric Schmidt warned we need 92 additional gigawatts. The grid is already stressed.
          </p>
        </div>

        {/* Master Status */}
        <div className={`glass rounded-2xl p-6 mb-8 border-2 ${
          overallStatus === 'critical' ? 'border-quantum-crimson bg-quantum-crimson/10' :
          overallStatus === 'warning' ? 'border-quantum-amber bg-quantum-amber/10' :
          'border-quantum-teal bg-quantum-teal/10'
        }`}>
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center space-x-4">
              <div className={`w-16 h-16 rounded-full flex items-center justify-center ${
                overallStatus === 'critical' ? 'bg-quantum-crimson fear-critical' :
                overallStatus === 'warning' ? 'bg-quantum-amber' : 'bg-quantum-teal'
              }`}>
                <Activity className="w-8 h-8 text-oasis-deep" />
              </div>
              <div>
                <div className="font-display text-2xl font-bold uppercase">
                  {overallStatus === 'critical' ? 'GRID CRITICAL' : overallStatus === 'warning' ? 'ELEVATED STRESS' : 'STABLE'}
                </div>
                <div className="text-oasis-muted">
                  {criticalCount} critical, {warningCount} warning, {gridNodes.length - criticalCount - warningCount} stable
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <div className="text-right">
                <div className="font-mono text-3xl font-bold">
                  {(totalLoad / totalCapacity * 100).toFixed(1)}%
                </div>
                <div className="text-oasis-muted text-sm">Total Grid Load</div>
              </div>
              <button
                onClick={() => setIsRunning(!isRunning)}
                className={`p-3 rounded-lg ${isRunning ? 'bg-quantum-crimson' : 'bg-quantum-teal'}`}
              >
                {isRunning ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Grid Nodes */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 mb-8">
          {gridNodes.map((node) => (
            <div key={node.id} className={`glass rounded-xl p-4 border ${
              node.status === 'critical' ? 'border-quantum-crimson' :
              node.status === 'warning' ? 'border-quantum-amber' : 'border-oasis-steel'
            }`}>
              <div className="flex items-center justify-between mb-2">
                <span className="font-bold text-sm truncate">{node.name}</span>
                {node.trend === 'up' ? <TrendingUp className="w-4 h-4 text-quantum-crimson" /> :
                 node.trend === 'down' ? <TrendingDown className="w-4 h-4 text-quantum-teal" /> :
                 <Activity className="w-4 h-4 text-oasis-muted" />}
              </div>
              
              <div className="relative h-4 bg-oasis-steel rounded-full overflow-hidden mb-2">
                <div 
                  className={`absolute left-0 top-0 h-full transition-all duration-500 ${
                    node.status === 'critical' ? 'bg-quantum-crimson' :
                    node.status === 'warning' ? 'bg-quantum-amber' : 'bg-quantum-teal'
                  }`}
                  style={{ width: `${Math.min(100, node.load)}%` }}
                />
                {node.load > 100 && (
                  <div className="absolute right-0 top-0 h-full w-1 bg-quantum-crimson animate-pulse" />
                )}
              </div>
              
              <div className="flex justify-between text-xs">
                <span className="font-mono">{node.load.toFixed(1)}%</span>
                <span className={`uppercase font-bold ${
                  node.status === 'critical' ? 'text-quantum-crimson' :
                  node.status === 'warning' ? 'text-quantum-amber' : 'text-quantum-teal'
                }`}>{node.status}</span>
              </div>
            </div>
          ))}
        </div>

        {/* AI Demand Warning */}
        <div className="glass rounded-2xl p-8 border border-quantum-amber/30">
          <div className="flex items-start space-x-4">
            <AlertTriangle className="w-12 h-12 text-quantum-amber flex-shrink-0" />
            <div>
              <h3 className="font-display text-2xl font-bold text-quantum-amber mb-2">
                The 92 Gigawatt Crisis
              </h3>
              <p className="text-oasis-muted mb-4">
                Eric Schmidt testified that AI infrastructure will need 92 additional gigawatts of power. 
                That's 92 new power plants. Traditional builds take 8-12 years. We don't have that kind of time.
              </p>
              <p className="text-oasis-light">
                <strong>Quantum Oasis Solution:</strong> Harvest waste heat from the very datacenters creating the demand. 
                Recover 20-40% of energy consumption. Turn the problem into the solution.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// ============================================
// OASIS FORGE - System Configurator
// ============================================
const ForgePage: React.FC = () => {
  const [config, setConfig] = useState<ForgeConfig>({
    vehicleType: 'van',
    tegUnits: 4,
    solarWatts: 400,
    batteryKwh: 5,
    meshNodes: 2,
    computeUnits: 1
  });

  const vehicleOptions = [
    { type: 'van', label: 'Ford E-Series Van', basePrice: 25000, desc: 'Mobile demonstration platform' },
    { type: 'truck', label: 'Box Truck', basePrice: 35000, desc: 'Higher capacity deployment' },
    { type: 'trailer', label: 'Cargo Trailer', basePrice: 15000, desc: 'Towable solution' },
    { type: 'stationary', label: 'Stationary Node', basePrice: 5000, desc: 'Fixed installation' }
  ];

  const calculateCost = () => {
    const vehicle = vehicleOptions.find(v => v.type === config.vehicleType);
    const baseCost = vehicle?.basePrice || 0;
    const tegCost = config.tegUnits * 850;
    const solarCost = config.solarWatts * 2;
    const batteryCost = config.batteryKwh * 400;
    const meshCost = config.meshNodes * 150;
    const computeCost = config.computeUnits * 500;
    return baseCost + tegCost + solarCost + batteryCost + meshCost + computeCost;
  };

  const calculateMonthlyRevenue = () => {
    const energyRevenue = config.tegUnits * 45 + (config.solarWatts / 100) * 25;
    const computeRevenue = config.computeUnits * 75;
    const meshRevenue = config.meshNodes * 20;
    return energyRevenue + computeRevenue + meshRevenue;
  };

  const calculatePayback = () => {
    const cost = calculateCost();
    const monthly = calculateMonthlyRevenue();
    return monthly > 0 ? (cost / monthly).toFixed(1) : 'N/A';
  };

  return (
    <div className="min-h-screen pt-20 px-4 pb-12">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="font-display text-4xl md:text-5xl font-bold mb-4">
            <span className="text-gradient">OASIS FORGE</span>
          </h1>
          <p className="text-oasis-muted max-w-2xl mx-auto">
            Configure your personal sovereignty node. See the cost, the revenue potential, and the path to ownership.
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Configuration Panel */}
          <div className="lg:col-span-2 space-y-6">
            {/* Vehicle Selection */}
            <div className="glass rounded-2xl p-6">
              <h3 className="font-display text-xl font-bold mb-4 flex items-center space-x-2">
                <Wrench className="w-5 h-5 text-quantum-cyan" />
                <span>Platform Type</span>
              </h3>
              <div className="grid sm:grid-cols-2 gap-4">
                {vehicleOptions.map((v) => (
                  <button
                    key={v.type}
                    onClick={() => setConfig({ ...config, vehicleType: v.type as ForgeConfig['vehicleType'] })}
                    className={`p-4 rounded-xl text-left transition-all ${
                      config.vehicleType === v.type 
                        ? 'bg-quantum-cyan/20 border-2 border-quantum-cyan' 
                        : 'bg-oasis-steel/30 border border-oasis-slate hover:border-quantum-cyan/50'
                    }`}
                  >
                    <div className="font-bold">{v.label}</div>
                    <div className="text-sm text-oasis-muted">{v.desc}</div>
                    <div className="text-quantum-teal font-mono mt-2">${v.basePrice.toLocaleString()}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Energy Harvesting */}
            <div className="glass rounded-2xl p-6">
              <h3 className="font-display text-xl font-bold mb-4 flex items-center space-x-2">
                <Zap className="w-5 h-5 text-quantum-teal" />
                <span>Energy Harvesting</span>
              </h3>
              
              <div className="space-y-6">
                <div>
                  <div className="flex justify-between mb-2">
                    <label className="flex items-center space-x-2">
                      <Thermometer className="w-4 h-4 text-quantum-amber" />
                      <span>TEG Units (Thermoelectric)</span>
                    </label>
                    <span className="font-mono text-quantum-cyan">{config.tegUnits} units</span>
                  </div>
                  <input 
                    type="range" min="0" max="12" value={config.tegUnits}
                    onChange={(e) => setConfig({ ...config, tegUnits: parseInt(e.target.value) })}
                    className="w-full accent-quantum-cyan"
                  />
                  <div className="flex justify-between text-xs text-oasis-muted mt-1">
                    <span>$850/unit</span>
                    <span>~{config.tegUnits * 50}W from waste heat</span>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between mb-2">
                    <label className="flex items-center space-x-2">
                      <Sun className="w-4 h-4 text-quantum-gold" />
                      <span>Solar Capacity</span>
                    </label>
                    <span className="font-mono text-quantum-cyan">{config.solarWatts}W</span>
                  </div>
                  <input 
                    type="range" min="0" max="1200" step="100" value={config.solarWatts}
                    onChange={(e) => setConfig({ ...config, solarWatts: parseInt(e.target.value) })}
                    className="w-full accent-quantum-gold"
                  />
                </div>

                <div>
                  <div className="flex justify-between mb-2">
                    <label className="flex items-center space-x-2">
                      <Battery className="w-4 h-4 text-quantum-teal" />
                      <span>Battery Storage</span>
                    </label>
                    <span className="font-mono text-quantum-cyan">{config.batteryKwh} kWh</span>
                  </div>
                  <input 
                    type="range" min="1" max="20" value={config.batteryKwh}
                    onChange={(e) => setConfig({ ...config, batteryKwh: parseInt(e.target.value) })}
                    className="w-full accent-quantum-teal"
                  />
                </div>
              </div>
            </div>

            {/* Network & Compute */}
            <div className="glass rounded-2xl p-6">
              <h3 className="font-display text-xl font-bold mb-4 flex items-center space-x-2">
                <Wifi className="w-5 h-5 text-quantum-violet" />
                <span>Network & Compute</span>
              </h3>
              
              <div className="space-y-6">
                <div>
                  <div className="flex justify-between mb-2">
                    <label className="flex items-center space-x-2">
                      <Radio className="w-4 h-4 text-quantum-violet" />
                      <span>Mesh Network Nodes</span>
                    </label>
                    <span className="font-mono text-quantum-cyan">{config.meshNodes}</span>
                  </div>
                  <input 
                    type="range" min="0" max="8" value={config.meshNodes}
                    onChange={(e) => setConfig({ ...config, meshNodes: parseInt(e.target.value) })}
                    className="w-full accent-quantum-violet"
                  />
                </div>

                <div>
                  <div className="flex justify-between mb-2">
                    <label className="flex items-center space-x-2">
                      <Cpu className="w-4 h-4 text-quantum-cyan" />
                      <span>Edge Compute Units</span>
                    </label>
                    <span className="font-mono text-quantum-cyan">{config.computeUnits}</span>
                  </div>
                  <input 
                    type="range" min="0" max="4" value={config.computeUnits}
                    onChange={(e) => setConfig({ ...config, computeUnits: parseInt(e.target.value) })}
                    className="w-full accent-quantum-cyan"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Summary Panel */}
          <div className="space-y-6">
            <div className="glass rounded-2xl p-6 glow-border sticky top-24">
              <h3 className="font-display text-xl font-bold mb-6 text-center">Your Configuration</h3>
              
              <div className="space-y-4 mb-8">
                <div className="flex justify-between py-2 border-b border-oasis-slate">
                  <span className="text-oasis-muted">Platform</span>
                  <span className="font-bold">{vehicleOptions.find(v => v.type === config.vehicleType)?.label}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-oasis-slate">
                  <span className="text-oasis-muted">TEG Units</span>
                  <span className="font-mono">{config.tegUnits}x</span>
                </div>
                <div className="flex justify-between py-2 border-b border-oasis-slate">
                  <span className="text-oasis-muted">Solar</span>
                  <span className="font-mono">{config.solarWatts}W</span>
                </div>
                <div className="flex justify-between py-2 border-b border-oasis-slate">
                  <span className="text-oasis-muted">Battery</span>
                  <span className="font-mono">{config.batteryKwh} kWh</span>
                </div>
                <div className="flex justify-between py-2 border-b border-oasis-slate">
                  <span className="text-oasis-muted">Mesh Nodes</span>
                  <span className="font-mono">{config.meshNodes}x</span>
                </div>
                <div className="flex justify-between py-2 border-b border-oasis-slate">
                  <span className="text-oasis-muted">Compute</span>
                  <span className="font-mono">{config.computeUnits}x</span>
                </div>
              </div>

              <div className="bg-oasis-steel/50 rounded-xl p-4 mb-4">
                <div className="text-center mb-4">
                  <div className="text-oasis-muted text-sm">Total Investment</div>
                  <div className="font-display text-4xl font-bold text-quantum-cyan">
                    ${calculateCost().toLocaleString()}
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4 text-center">
                  <div>
                    <div className="text-oasis-muted text-xs">Monthly Revenue</div>
                    <div className="font-mono text-xl text-quantum-teal">${calculateMonthlyRevenue()}</div>
                  </div>
                  <div>
                    <div className="text-oasis-muted text-xs">Payback Period</div>
                    <div className="font-mono text-xl text-quantum-gold">{calculatePayback()} mo</div>
                  </div>
                </div>
              </div>

              <button className="w-full py-4 bg-gradient-to-r from-quantum-cyan to-quantum-teal text-oasis-deep font-bold rounded-xl hover:scale-105 transition-transform">
                Save Configuration
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// ============================================
// MAGGIE.AI - Knowledge Base Chat
// ============================================
const MaggiePage: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: 'maggie',
      content: "Hello! I'm Maggie, your guide to the Quantum Oasis ecosystem. I can answer questions about our technology, philosophy, and vision. What would you like to know?",
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  // Knowledge base for Maggie
  const knowledgeBase: Record<string, string> = {
    'what is quantum oasis': 'Quantum Oasis is a modular, sovereignty-first operating system for decentralized energy harvesting and data independence. We combine thermoelectric generators, solar, mesh networking, and edge compute into owned infrastructure that generates income 24/7.',
    'ubo': 'Universal Basic Ownership (UBO) is our alternative to Universal Basic Income. Instead of government checks creating dependency, UBO gives people infrastructure they own that generates income whether they have a traditional job or not. Our analysis shows UBO could save $717 billion annually compared to UBI.',
    'ubi': 'While Universal Basic Income provides government checks, it creates permanent dependency and costs approximately $700 billion per year. Universal Basic Ownership is different — it builds assets people own, creating sovereignty instead of dependency.',
    'energy': 'We harvest energy from multiple sources: thermoelectric generators (waste heat), piezoelectric systems (vibration), solar integration, and RF harvesting. The University of Rochester published research showing 15x efficiency improvement in thermoelectric generation.',
    '92 gigawatt': 'Eric Schmidt testified that AI infrastructure will need 92 additional gigawatts of power — equivalent to 92 nuclear plants. Traditional builds take 8-12 years. Quantum Oasis provides a faster path by harvesting waste heat from the very datacenters creating demand.',
    'patents': 'We have three provisional patents filed with the USPTO covering thermoelectric energy harvesting integrated with mesh networking, piezoelectric harvesting systems, and multi-source harvesting controllers.',
    'tribal': 'Our tribal pilot program deploys on sovereign tribal lands, leveraging regulatory sovereignty to bypass state utility commission delays. This 12-month proof of concept demonstrates the complete system before broader scaling.',
    'maggie': "I'm Maggie.ai — a therapeutic AI companion designed especially for non-verbal communication. Twenty years ago, the founder wrote an article for Richland County Magazine about Raemelton Equestrian Center in Mansfield, where Karen Sawyer worked with non-verbal individuals. That experience planted the seed for this technology — giving voice to those who need it most.",
    'modules': 'The Quantum Oasis Operating System includes modular components: The Oasis (core energy), Maggie.ai (therapeutic AI), Shadow (research/OSINT), Friction-Free (blockchain music), SynWave Studio (zero-latency collaboration), WeTube (decentralized video), and LLM Pipeline (local AI training).',
    'forge': 'The Oasis Forge is our configuration tool where you can design your own sovereignty node — choosing vehicle platform, TEG units, solar capacity, battery storage, mesh nodes, and compute units. It calculates cost, monthly revenue potential, and payback period.',
  };

  const findAnswer = (question: string): string => {
    const q = question.toLowerCase();
    
    for (const [key, value] of Object.entries(knowledgeBase)) {
      if (q.includes(key)) return value;
    }

    if (q.includes('cost') || q.includes('price') || q.includes('how much')) {
      return 'Costs vary based on configuration. A basic residential node starts around $5,000, while a full mobile demonstration platform can range from $25,000-$50,000. Use the Oasis Forge to configure your exact setup and see pricing.';
    }

    if (q.includes('revenue') || q.includes('earn') || q.includes('money')) {
      return 'Revenue depends on your configuration. A typical residential node can generate $400-1,500/month from energy harvesting and compute services. The Oasis Forge shows estimated monthly revenue for any configuration.';
    }

    if (q.includes('ray') || q.includes('founder') || q.includes('who created')) {
      return 'Quantum Oasis was founded by Ray Baughman, a 56-year-old inventor from Mansfield, Ohio. Twenty years ago, Ray wrote an article for Richland County Magazine about Raemelton Equestrian Center, where he witnessed the needs of non-verbal individuals — planting the seed for Maggie.ai. He has filed three USPTO patents for this technology.';
    }

    return "I'm not sure about that specific topic, but I'd love to help you understand Quantum Oasis better. Try asking about our technology, Universal Basic Ownership, the 92 gigawatt crisis, our modules, or the Oasis Forge configuration tool.";
  };

  const handleSend = () => {
    if (!input.trim()) return;

    const userMessage: ChatMessage = {
      role: 'user',
      content: input,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsTyping(true);

    setTimeout(() => {
      const response = findAnswer(input);
      const maggieMessage: ChatMessage = {
        role: 'maggie',
        content: response,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, maggieMessage]);
      setIsTyping(false);
    }, 1000 + Math.random() * 1000);
  };

  return (
    <div className="min-h-screen pt-20 px-4 pb-12">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <div className="w-24 h-24 mx-auto mb-4 rounded-full bg-gradient-to-br from-quantum-violet to-quantum-cyan flex items-center justify-center">
            <Brain className="w-12 h-12 text-oasis-deep" />
          </div>
          <h1 className="font-display text-4xl font-bold mb-2">
            <span className="text-gradient">Maggie.ai</span>
          </h1>
          <p className="text-oasis-muted">Your guide through the Quantum Oasis</p>
        </div>

        <div className="glass rounded-2xl overflow-hidden glow-border">
          {/* Chat Messages */}
          <div className="h-[500px] overflow-y-auto p-6 space-y-4">
            {messages.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                  msg.role === 'user' 
                    ? 'bg-quantum-cyan/20 border border-quantum-cyan/30' 
                    : 'bg-oasis-steel/50 border border-oasis-slate'
                }`}>
                  {msg.role === 'maggie' && (
                    <div className="flex items-center space-x-2 mb-2">
                      <Brain className="w-4 h-4 text-quantum-violet" />
                      <span className="text-quantum-violet font-bold text-sm">Maggie</span>
                    </div>
                  )}
                  <p className="text-oasis-light">{msg.content}</p>
                </div>
              </div>
            ))}
            {isTyping && (
              <div className="flex justify-start">
                <div className="bg-oasis-steel/50 rounded-2xl px-4 py-3 border border-oasis-slate">
                  <div className="flex items-center space-x-2">
                    <Brain className="w-4 h-4 text-quantum-violet animate-pulse" />
                    <span className="text-oasis-muted">Maggie is typing...</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Input */}
          <div className="border-t border-oasis-slate p-4">
            <div className="flex items-center space-x-4">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                placeholder="Ask Maggie anything about Quantum Oasis..."
                className="flex-1 bg-oasis-steel/50 border border-oasis-slate rounded-xl px-4 py-3 text-oasis-light placeholder-oasis-muted focus:outline-none focus:border-quantum-cyan"
              />
              <button
                onClick={handleSend}
                className="p-3 bg-gradient-to-r from-quantum-cyan to-quantum-teal rounded-xl hover:scale-105 transition-transform"
              >
                <Send className="w-5 h-5 text-oasis-deep" />
              </button>
            </div>
          </div>
        </div>

        {/* Quick Questions */}
        <div className="mt-6">
          <p className="text-oasis-muted text-sm mb-3">Quick questions:</p>
          <div className="flex flex-wrap gap-2">
            {['What is Quantum Oasis?', 'Tell me about UBO', 'The 92 gigawatt crisis', 'Available modules'].map((q) => (
              <button
                key={q}
                onClick={() => { setInput(q); }}
                className="px-4 py-2 bg-oasis-steel/50 rounded-full text-sm text-oasis-muted hover:text-oasis-light hover:border-quantum-cyan/50 border border-oasis-slate transition-colors"
              >
                {q}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

// ============================================
// MODULES PAGE
// ============================================
const ModulesPage: React.FC = () => {
  const modules = [
    { 
      id: 'oasis', 
      name: 'The Oasis', 
      icon: Zap, 
      color: 'quantum-cyan',
      repo: 'The-Oasis',
      desc: 'Core energy harvesting, mesh networking, and base infrastructure. The foundation of sovereignty.',
      status: 'Active'
    },
    { 
      id: 'maggie', 
      name: 'Maggie.ai', 
      icon: Brain, 
      color: 'quantum-violet',
      repo: 'maggie-architecture',
      desc: 'Therapeutic AI companion for non-verbal communication. Voice for the voiceless.',
      status: 'Active'
    },
    { 
      id: 'shadow', 
      name: 'Shadow', 
      icon: Eye, 
      color: 'quantum-amber',
      repo: 'shadow',
      desc: 'Research and OSINT tool. Connect dots without gatekeepers. Information sovereignty.',
      status: 'Active'
    },
    { 
      id: 'friction-free', 
      name: 'Friction-Free', 
      icon: Music, 
      color: 'quantum-gold',
      repo: 'friction-free',
      desc: 'Blockchain music streaming. Creators own their work. No extraction, no middlemen.',
      status: 'Active'
    },
    { 
      id: 'synwave', 
      name: 'SynWave Studio', 
      icon: Radio, 
      color: 'quantum-teal',
      repo: 'synwavavestudio',
      desc: 'Zero-latency real-time recording and streaming across distance. Eventually AR presence.',
      status: 'Development'
    },
    { 
      id: 'wetube', 
      name: 'WeTube', 
      icon: Play, 
      color: 'quantum-crimson',
      repo: 'wetube',
      desc: 'Decentralized video and creator platform. Your content, your rules.',
      status: 'Development'
    },
    { 
      id: 'llm-pipeline', 
      name: 'LLM Pipeline', 
      icon: Database, 
      color: 'quantum-cyan',
      repo: 'llm-pipeline',
      desc: 'Dataset cleaner and chunker for local AI training. Data sovereignty starts here.',
      status: 'Active'
    },
    { 
      id: 'forge', 
      name: 'The Forge', 
      icon: Wrench, 
      color: 'quantum-amber',
      repo: 'the-mobile-oasis',
      desc: 'Hardware configurator, BOM management, and system design tool.',
      status: 'Active'
    },
  ];

  return (
    <div className="min-h-screen pt-20 px-4 pb-12">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="font-display text-4xl md:text-5xl font-bold mb-4">
            <span className="text-gradient">QU OS MODULES</span>
          </h1>
          <p className="text-oasis-muted max-w-2xl mx-auto">
            A modular operating system. Add what you need. Remove what you don't. 
            Every module is optional and open source.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {modules.map((mod) => (
            <div key={mod.id} className="glass rounded-2xl p-6 glow-border hover:scale-[1.02] transition-transform">
              <div className="flex items-start justify-between mb-4">
                <div className={`w-14 h-14 rounded-xl bg-${mod.color}/20 flex items-center justify-center`}>
                  <mod.icon className={`w-7 h-7 text-${mod.color}`} />
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                  mod.status === 'Active' ? 'bg-quantum-teal/20 text-quantum-teal' : 'bg-quantum-amber/20 text-quantum-amber'
                }`}>
                  {mod.status}
                </span>
              </div>
              
              <h3 className="font-display text-xl font-bold mb-2">{mod.name}</h3>
              <p className="text-oasis-muted mb-4">{mod.desc}</p>
              
              <a 
                href={`https://github.com/artofray/${mod.repo}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center space-x-2 text-quantum-cyan hover:text-quantum-teal transition-colors"
              >
                <Github className="w-4 h-4" />
                <span className="font-mono text-sm">artofray/{mod.repo}</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// ============================================
// MAIN APP
// ============================================
const App: React.FC = () => {
  const [currentPage, setCurrentPage] = useState('home');

  const renderPage = () => {
    switch (currentPage) {
      case 'home': return <HomePage setCurrentPage={setCurrentPage} />;
      case 'fearbox': return <FearBoxPage />;
      case 'forge': return <ForgePage />;
      case 'maggie': return <MaggiePage />;
      case 'modules': return <ModulesPage />;
      default: return <HomePage setCurrentPage={setCurrentPage} />;
    }
  };

  return (
    <div className="min-h-screen bg-oasis-deep">
      <Navigation currentPage={currentPage} setCurrentPage={setCurrentPage} />
      {renderPage()}
      
      {/* Footer */}
      <footer className="border-t border-oasis-steel py-12 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-quantum-cyan to-quantum-teal flex items-center justify-center">
                <Zap className="w-6 h-6 text-oasis-deep" />
              </div>
              <span className="font-display font-bold text-xl">QUANTUM OASIS</span>
            </div>
            
            <div className="flex items-center space-x-6 text-oasis-muted">
              <a href="https://github.com/artofray" target="_blank" rel="noopener noreferrer" className="hover:text-quantum-cyan transition-colors flex items-center space-x-2">
                <Github className="w-5 h-5" />
                <span>GitHub</span>
              </a>
              <a href="https://maggie.thequantumoasis.com" target="_blank" rel="noopener noreferrer" className="hover:text-quantum-cyan transition-colors">
                Maggie.ai
              </a>
            </div>
            
            <div className="text-oasis-muted text-sm">
              <em>"The loudest thing in the room should be your thoughts."</em>
            </div>
          </div>
          
          <div className="mt-8 pt-8 border-t border-oasis-slate text-center text-oasis-muted text-sm">
            © 2025 Quantum Oasis. Sovereignty Through Infrastructure. | Mansfield, Ohio
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;
