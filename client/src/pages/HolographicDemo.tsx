import { FiGlobe, FiLock } from 'react-icons/fi';
import BentoItem from "@/components/ui/holographic-interface";

export default function HolographicDemo() {
    return (
        <div className="main-container">
            <div className="aurora-bg"></div>
            <div className="w-full max-w-6xl z-10">
                <h1 className="text-4xl sm:text-5xl font-bold text-white text-center mb-8">Holographic Interface</h1>
                <div className="bento-grid">
                    
                    <BentoItem className="col-span-2 row-span-2 flex flex-col justify-between">
                        <svg className="animated-border"><rect width="100%" height="100%" rx="12"/></svg>
                        <div>
                            <h2 className="text-2xl font-bold text-white">Quantum Analytics</h2>
                            <p className="mt-2 text-gray-400">Process complex data streams with our AI-powered visualization engine, providing predictive insights in real-time.</p>
                        </div>
                        <div className="mt-4 h-48 bg-black/20 border border-white/10 rounded-lg flex items-center justify-center text-gray-500">
                            [Live Data Feed Placeholder]
                        </div>
                    </BentoItem>

                    <BentoItem className="flex flex-col items-start justify-between">
                         <svg className="animated-border"><rect width="100%" height="100%" rx="12"/></svg>
                         <div>
                            <FiGlobe className="text-3xl text-indigo-400" />
                            <h2 className="text-xl font-bold text-white mt-4">Orbital CDN</h2>
                            <p className="mt-2 text-gray-400 text-sm">Deploy content through a decentralized, global network for unparalleled speed and resilience.</p>
                         </div>
                    </BentoItem>

                    <BentoItem className="flex flex-col items-start justify-between">
                        <svg className="animated-border"><rect width="100%" height="100%" rx="12"/></svg>
                        <div>
                            <FiLock className="text-3xl text-indigo-400" />
                            <h2 className="text-xl font-bold text-white mt-4">Biometric Auth</h2>
                            <p className="mt-2 text-gray-400 text-sm">Secure your system with next-generation biometric authentication protocols.</p>
                        </div>
                    </BentoItem>
                    
                    <BentoItem className="col-span-2 col-span-full-mobile">
                        <svg className="animated-border"><rect width="100%" height="100%" rx="12"/></svg>
                        <h2 className="text-xl font-bold text-white">Neural Functions</h2>
                        <p className="mt-2 text-gray-400 text-sm">Execute complex backend logic on our adaptive neural network. Scale beyond serverless.</p>
                    </BentoItem>
                </div>
            </div>
        </div>
    );
}
