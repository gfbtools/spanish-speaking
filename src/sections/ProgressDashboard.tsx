import type { UserProgress } from '@/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { 
  Trophy, 
  Flame, 
  Clock, 
  BookOpen, 
  Brain,
  TrendingUp,
  BarChart3,
  Target
} from 'lucide-react';

interface ProgressDashboardProps {
  progress: UserProgress;
}

export function ProgressDashboard({ progress }: ProgressDashboardProps) {
  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  const getSkillColor = (level: number) => {
    if (level >= 0.8) return 'bg-green-500';
    if (level >= 0.6) return 'bg-amber-500';
    return 'bg-red-500';
  };

  return (
    <div className="space-y-6">
      {/* Overview Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-amber-50 to-orange-50 border-amber-200">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center">
                <BookOpen className="w-5 h-5 text-amber-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-800">
                  {progress.lessons_completed}
                </p>
                <p className="text-xs text-gray-600">Lessons Done</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-red-50 to-rose-50 border-red-200">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                <Flame className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-800">
                  {progress.streak_days}
                </p>
                <p className="text-xs text-gray-600">Day Streak</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                <Clock className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-800">
                  {formatTime(progress.study_time_minutes)}
                </p>
                <p className="text-xs text-gray-600">Study Time</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                <Brain className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-800">
                  {progress.srs_stats.total_cards}
                </p>
                <p className="text-xs text-gray-600">Flashcards</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Overall Progress */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-amber-600" />
            Overall Progress
          </CardTitle>
          <CardDescription>
            You're {Math.round(progress.overall_progress * 100)}% through your Spanish journey!
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>Level {progress.current_level}</span>
                <span>{progress.lessons_completed} / {progress.lessons_total} lessons</span>
              </div>
              <Progress value={progress.overall_progress * 100} className="h-3" />
            </div>
            
            <div className="flex items-center justify-between">
              <Badge variant="secondary" className="bg-amber-100 text-amber-700">
                Current Level: {progress.current_level}
              </Badge>
              <span className="text-sm text-gray-500">
                Longest Streak: {progress.longest_streak} days
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Skill Levels */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-amber-600" />
            Skill Breakdown
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Object.entries(progress.skill_levels).map(([skill, level]) => (
              <div key={skill}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="capitalize">{skill}</span>
                  <span>{Math.round(level * 100)}%</span>
                </div>
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div 
                    className={`h-full ${getSkillColor(level)} transition-all duration-500`}
                    style={{ width: `${level * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* SRS Stats */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="w-5 h-5 text-amber-600" />
            Spaced Repetition Stats
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-3 bg-blue-50 rounded-lg">
              <p className="text-2xl font-bold text-blue-600">
                {progress.srs_stats.due_now}
              </p>
              <p className="text-xs text-gray-600">Cards Due</p>
            </div>
            <div className="text-center p-3 bg-green-50 rounded-lg">
              <p className="text-2xl font-bold text-green-600">
                {progress.srs_stats.mature_cards}
              </p>
              <p className="text-xs text-gray-600">Mature</p>
            </div>
            <div className="text-center p-3 bg-amber-50 rounded-lg">
              <p className="text-2xl font-bold text-amber-600">
                {progress.srs_stats.young_cards}
              </p>
              <p className="text-xs text-gray-600">Young</p>
            </div>
            <div className="text-center p-3 bg-purple-50 rounded-lg">
              <p className="text-2xl font-bold text-purple-600">
                {Math.round(progress.srs_stats.retention_rate * 100)}%
              </p>
              <p className="text-xs text-gray-600">Retention</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Achievements */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="w-5 h-5 text-amber-600" />
            Recent Achievements
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {progress.streak_days >= 7 && (
              <Badge className="bg-orange-100 text-orange-700 px-3 py-1">
                <Flame className="w-4 h-4 mr-1" />
                7-Day Streak
              </Badge>
            )}
            {progress.streak_days >= 30 && (
              <Badge className="bg-red-100 text-red-700 px-3 py-1">
                <Flame className="w-4 h-4 mr-1" />
                30-Day Streak
              </Badge>
            )}
            {progress.lessons_completed >= 10 && (
              <Badge className="bg-blue-100 text-blue-700 px-3 py-1">
                <BookOpen className="w-4 h-4 mr-1" />
                10 Lessons
              </Badge>
            )}
            {progress.srs_stats.total_cards >= 100 && (
              <Badge className="bg-green-100 text-green-700 px-3 py-1">
                <Brain className="w-4 h-4 mr-1" />
                100 Cards
              </Badge>
            )}
            {progress.study_time_minutes >= 300 && (
              <Badge className="bg-purple-100 text-purple-700 px-3 py-1">
                <Clock className="w-4 h-4 mr-1" />
                5 Hours Studied
              </Badge>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
