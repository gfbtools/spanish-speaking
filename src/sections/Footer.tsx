import { Github, Twitter, Mail, Heart } from 'lucide-react';

export function Footer() {
  return (
    <footer className="bg-white border-t border-amber-200 mt-12">
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="text-center md:text-left">
            <h3 className="font-bold text-gray-800">Spanish Learning App</h3>
            <p className="text-sm text-gray-500">
              Master Spanish through interactive lessons and practice
            </p>
          </div>

          <div className="flex items-center gap-4">
            <a 
              href="https://github.com" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-gray-400 hover:text-amber-600 transition-colors"
            >
              <Github className="w-5 h-5" />
            </a>
            <a 
              href="https://twitter.com" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-gray-400 hover:text-amber-600 transition-colors"
            >
              <Twitter className="w-5 h-5" />
            </a>
            <a 
              href="mailto:hello@spanishlearning.app"
              className="text-gray-400 hover:text-amber-600 transition-colors"
            >
              <Mail className="w-5 h-5" />
            </a>
          </div>
        </div>

        <div className="border-t border-gray-100 mt-6 pt-6 text-center">
          <p className="text-sm text-gray-500 flex items-center justify-center gap-1">
            Made with <Heart className="w-4 h-4 text-red-500 fill-red-500" /> for language learners
          </p>
          <p className="text-xs text-gray-400 mt-1">
            © {new Date().getFullYear()} Spanish Learning App. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
