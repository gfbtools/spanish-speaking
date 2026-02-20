import { Card, CardContent } from '@/components/ui/card';
import { MapPin, MessageCircle, Volume2, Trophy, BookOpen, Globe } from 'lucide-react';

export function Hero() {
  return (
    <section className="py-12">
      <div className="text-center mb-10">
        <h2 className="text-4xl md:text-5xl font-bold text-gray-800 mb-4">
          Learn Spanish with{' '}
          <span className="bg-gradient-to-r from-amber-500 to-red-500 bg-clip-text text-transparent">
            Confidence
          </span>
        </h2>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Master real-world Spanish through interactive lessons, authentic dialogues, 
          and personalized practice. Now with <strong>Puerto Rican Spanish</strong> support!
        </p>
        <div className="flex flex-wrap justify-center gap-2 mt-4">
          <span className="px-3 py-1 bg-amber-100 text-amber-700 rounded-full text-sm">15 A1 Lessons</span>
          <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm">160+ Vocabulary Words</span>
          <span className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-sm">Puerto Rican Spanish</span>
          <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm">4 Dialects</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <Card className="bg-white/80 backdrop-blur-sm border-amber-200 hover:shadow-lg transition-shadow">
          <CardContent className="p-6 flex flex-col items-center text-center">
            <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center mb-3">
              <BookOpen className="w-6 h-6 text-amber-600" />
            </div>
            <h3 className="font-semibold text-gray-800">15 A1 Lessons</h3>
            <p className="text-sm text-gray-600 mt-1">Travel, family, restaurant, shopping, and more real-world scenarios</p>
          </CardContent>
        </Card>

        <Card className="bg-white/80 backdrop-blur-sm border-red-200 hover:shadow-lg transition-shadow">
          <CardContent className="p-6 flex flex-col items-center text-center">
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mb-3">
              <Globe className="w-6 h-6 text-red-600" />
            </div>
            <h3 className="font-semibold text-gray-800">Puerto Rican Spanish</h3>
            <p className="text-sm text-gray-600 mt-1">Learn unique words like guagua, china, zafacón with Caribbean pronunciation</p>
          </CardContent>
        </Card>

        <Card className="bg-white/80 backdrop-blur-sm border-orange-200 hover:shadow-lg transition-shadow">
          <CardContent className="p-6 flex flex-col items-center text-center">
            <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mb-3">
              <MessageCircle className="w-6 h-6 text-orange-600" />
            </div>
            <h3 className="font-semibold text-gray-800">Multiple Dialects</h3>
            <p className="text-sm text-gray-600 mt-1">Study Spanish from Spain, Mexico, Puerto Rico, and Latin America</p>
          </CardContent>
        </Card>

        <Card className="bg-white/80 backdrop-blur-sm border-red-200 hover:shadow-lg transition-shadow">
          <CardContent className="p-6 flex flex-col items-center text-center">
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mb-3">
              <MapPin className="w-6 h-6 text-red-600" />
            </div>
            <h3 className="font-semibold text-gray-800">Real Scenarios</h3>
            <p className="text-sm text-gray-600 mt-1">Learn practical conversations for travel, shopping, and daily life</p>
          </CardContent>
        </Card>

        <Card className="bg-white/80 backdrop-blur-sm border-blue-200 hover:shadow-lg transition-shadow">
          <CardContent className="p-6 flex flex-col items-center text-center">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-3">
              <Volume2 className="w-6 h-6 text-blue-600" />
            </div>
            <h3 className="font-semibold text-gray-800">Pronunciation</h3>
            <p className="text-sm text-gray-600 mt-1">Practice with IPA transcriptions and dialect-specific audio</p>
          </CardContent>
        </Card>

        <Card className="bg-white/80 backdrop-blur-sm border-rose-200 hover:shadow-lg transition-shadow">
          <CardContent className="p-6 flex flex-col items-center text-center">
            <div className="w-12 h-12 bg-rose-100 rounded-full flex items-center justify-center mb-3">
              <Trophy className="w-6 h-6 text-rose-600" />
            </div>
            <h3 className="font-semibold text-gray-800">Track Progress</h3>
            <p className="text-sm text-gray-600 mt-1">Monitor your learning with detailed analytics and streaks</p>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
