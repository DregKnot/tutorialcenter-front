import React from 'react';
import { 
  UserPlus, UserCheck, BookOpen, Play, CheckSquare, Target, Award, Flame,
  Calculator, Atom, FlaskConical, Dna, Feather, Globe, Trophy, Sparkles, Zap, Crown
} from 'lucide-react';
import TCMedal from '../../components/common/badges/TCMedal';
import BaseBadge3D from '../../components/common/badges/BaseBadge3D';

export default function BadgeDemo() {
  return (
    <div className="min-h-screen bg-[#070b12] text-white py-16 px-4">
      <div className="max-w-7xl mx-auto space-y-20">

        {/* ============================================================ */}
        {/* HERO SHOWCASE: EXACT REFERENCE REWARD MEDALS */}
        {/* ============================================================ */}
        <div className="relative p-10 rounded-3xl bg-gradient-to-b from-[#131b2c]/80 to-[#0a0f1d]/90 border border-white/10 shadow-2xl backdrop-blur-xl overflow-hidden">
          {/* Header */}
          <div className="text-center mb-12">
            <span className="text-xs font-black tracking-[0.3em] uppercase text-cyan-400">Custom Branded Achievement System</span>
            <h1 className="text-5xl font-black tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-gray-200 via-white to-gray-400 uppercase mt-2">
              REWARDS
            </h1>
            <p className="text-sm text-gray-400 mt-2 max-w-lg mx-auto">
              Precision mathematical 100% Vector SVG medals featuring beveled frames, corner rivets, gemstone cores, attached progressive wings, and glowing bioluminescent emblems.
            </p>
          </div>

          {/* Reference Lineup with Precise Scale & Wing Progression */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-6 sm:gap-8 items-end justify-items-center">
            
            {/* Bronze Tier (Starburst backplate + Emerald Gem) */}
            <TCMedal 
              tier="bronze" 
              gemColor="emerald" 
              title="Bronze Master" 
              subtitle="70% Accuracy"
              size={165}
            />

            {/* Silver Tier (3 Sculpted Silver Wings + Blue Ribbon + Sapphire Gem) */}
            <TCMedal 
              tier="silver" 
              gemColor="sapphire" 
              title="Silver Master" 
              subtitle="80% Accuracy"
              size={172}
            />

            {/* Gold Tier (3 Sculpted Gold Wings with Ribbing Texture + Red Ribbon + Ruby Gem) */}
            <TCMedal 
              tier="gold" 
              gemColor="ruby" 
              title="Gold Master" 
              subtitle="90% Accuracy"
              size={186}
            />

            {/* Platinum Tier (3 Cybernetic Crystal Wings + Inset Filigree + Cyan Gem) */}
            <TCMedal 
              tier="platinum" 
              gemColor="cyan" 
              title="Platinum Master" 
              subtitle="95% Accuracy"
              size={186}
            />

            {/* Diamond Tier (5-Feather Liquid Glass Wings + 3D Glass Shell + Glowing Bioluminescent Crest) */}
            <TCMedal 
              tier="diamond" 
              gemColor="diamond" 
              title="Diamond Genius" 
              subtitle="100% Accuracy"
              size={205}
            />

          </div>
        </div>

        {/* ============================================================ */}
        {/* SECTION 2: SUBJECT MASTERY WITH CUSTOM SUBJECT ICONS */}
        {/* ============================================================ */}
        <div>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 border-b border-white/10 pb-4 gap-2">
            <div>
              <h2 className="text-2xl font-black tracking-wider uppercase text-white flex items-center gap-2">
                <Sparkles className="text-yellow-400 w-6 h-6" /> Subject Mastery Medals
              </h2>
              <p className="text-xs text-gray-400">Dynamic icon & color injection for all school subjects</p>
            </div>
            <span className="self-start sm:self-auto px-3 py-1 bg-yellow-500/10 text-yellow-400 border border-yellow-500/20 rounded-full text-[11px] font-bold uppercase tracking-wider">
              Category #4 in Specification
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-6 items-end">
            <TCMedal 
              tier="gold" 
              gemColor="darkBlue" 
              Icon={Calculator} 
              title="Math Master" 
              subtitle="Level: Gold (80%)"
              size={155}
            />
            <TCMedal 
              tier="platinum" 
              gemColor="sapphire" 
              Icon={Feather} 
              title="English Expert" 
              subtitle="Level: Platinum (90%)"
              size={155}
            />
            <TCMedal 
              tier="gold" 
              gemColor="ruby" 
              Icon={Atom} 
              title="Physics Genius" 
              subtitle="Level: Gold (80%)"
              size={155}
            />
            <TCMedal 
              tier="bronze" 
              gemColor="emerald" 
              Icon={FlaskConical} 
              title="Chemistry Scholar" 
              subtitle="Level: Bronze (60%)"
              size={145}
            />
            <TCMedal 
              tier="silver" 
              gemColor="sapphire" 
              Icon={Dna} 
              title="Biology Mastermind" 
              subtitle="Level: Silver (70%)"
              size={150}
            />
            <TCMedal 
              tier="diamond" 
              Icon={Globe} 
              title="Geography Explorer" 
              subtitle="Level: Diamond (95%)"
              size={170}
            />
          </div>
        </div>

        {/* ============================================================ */}
        {/* SECTION 3: SPEED & RANK AWARDS */}
        {/* ============================================================ */}
        <div>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 border-b border-white/10 pb-4 gap-2">
            <div>
              <h2 className="text-2xl font-black tracking-wider uppercase text-white flex items-center gap-2">
                <Zap className="text-cyan-400 w-6 h-6" /> Speed & Rank Badges
              </h2>
              <p className="text-xs text-gray-400">Awarded for high answering velocity and overall academic leaderboard standings</p>
            </div>
            <span className="self-start sm:self-auto px-3 py-1 bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 rounded-full text-[11px] font-bold uppercase tracking-wider">
              Categories #6 & #10
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 items-end">
            <TCMedal 
              tier="gold" 
              gemColor="ruby" 
              Icon={Zap} 
              title="Lightning Brain" 
              subtitle="7 Qs under 8 mins"
              size={160}
            />
            <TCMedal 
              tier="diamond" 
              Icon={Crown} 
              title="#1 Student" 
              subtitle="Top of Leaderboard"
              size={180}
            />
            <TCMedal 
              tier="silver" 
              gemColor="sapphire" 
              Icon={Trophy} 
              title="Weekly Champion" 
              subtitle="Best weekly aggregate"
              size={155}
            />
            <TCMedal 
              tier="gold" 
              gemColor="gold" 
              Icon={Flame} 
              title="365-Day Streak" 
              subtitle="Year of Excellence"
              size={160}
            />
          </div>
        </div>

        {/* ============================================================ */}
        {/* SECTION 4: WELCOME & ONBOARDING (SHIELD/HEXAGON BASES) */}
        {/* ============================================================ */}
        <div>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 border-b border-white/10 pb-4 gap-2">
            <div>
              <h2 className="text-2xl font-black tracking-wider uppercase text-white flex items-center gap-2">
                <Target className="text-green-400 w-6 h-6" /> Welcome & Onboarding Badges
              </h2>
              <p className="text-xs text-gray-400">Early user achievements with Shield, Hexagon, and Star shapes</p>
            </div>
            <span className="self-start sm:self-auto px-3 py-1 bg-green-500/10 text-green-400 border border-green-500/20 rounded-full text-[11px] font-bold uppercase tracking-wider">
              Category #1
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-4">
            {[
              { id: 1, title: 'Welcome Aboard', Icon: UserPlus, shape: 'shield', color: 'primaryBlue' },
              { id: 2, title: 'Profile Complete', Icon: UserCheck, shape: 'hexagon', color: 'yellow' },
              { id: 3, title: 'Ready to Learn', Icon: BookOpen, shape: 'shield', color: 'green' },
              { id: 4, title: 'First Step', Icon: Play, shape: 'star', color: 'primaryRed' },
              { id: 5, title: 'First Answer', Icon: CheckSquare, shape: 'hexagon', color: 'green' },
              { id: 6, title: 'Practice Starter', Icon: Target, shape: 'shield', color: 'blue' },
              { id: 7, title: 'First Achievement', Icon: Award, shape: 'star', color: 'yellow' },
              { id: 8, title: 'Learning Begins', Icon: Flame, shape: 'hexagon', color: 'primaryRed' },
            ].map((badge) => (
              <div key={badge.id} className="flex flex-col items-center text-center p-3 bg-white/5 rounded-2xl border border-white/5 hover:border-white/20 transition-colors">
                <BaseBadge3D shape={badge.shape} color={badge.color} Icon={badge.Icon} size={85} />
                <h3 className="mt-3 font-bold text-xs text-gray-200 line-clamp-1">{badge.title}</h3>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
