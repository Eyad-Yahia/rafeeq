import { useState } from 'react';
import { AccessibilityWidget } from 'rafeeq-a11y';
import 'rafeeq-a11y/styles.css';
function App() {
  const [darkMode, setDarkMode] = useState(false);

  return (
    <>
      <div className={`min-h-screen ${darkMode ? 'dark' : ''}`}>
        <div className="bg-white text-gray-900 min-h-screen font-serif transition-colors duration-300">

          {/* Header */}
          <header className="border-b border-gray-200 sticky top-0 bg-white/80 backdrop-blur-md z-50">
            <div className="max-w-5xl mx-auto px-6 py-4 flex justify-between items-center">
              <h1 className="text-2xl font-bold tracking-tight text-emerald-600">TechDaily</h1>
              <nav className="space-x-6 hidden sm:block">
                <a href="#" className="hover:text-emerald-600 font-medium transition-colors">News</a>
                <a href="#" className="hover:text-emerald-600 font-medium transition-colors">Reviews</a>
                <a href="#" className="hover:text-emerald-600 font-medium transition-colors">Tutorials</a>
              </nav>
              <button
                className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 font-medium shadow-sm transition-all"
                onClick={() => alert("Subscribed!")}
              >
                Subscribe
              </button>
            </div>
          </header>

          {/* Main Content */}
          <main className="max-w-3xl mx-auto px-6 py-12">
            <article className="prose lg:prose-lg max-w-none">
              <div className="mb-8">
                <span className="text-sm font-semibold text-emerald-600 uppercase tracking-wider">Technology</span>
                <h1 className="text-4xl sm:text-5xl font-extrabold mt-2 mb-4 leading-tight">The Future of Web Accessibility is Here</h1>
                <p className="text-gray-500 text-lg">Published on August 8, 2026 by Eyad Yahia</p>
              </div>

              <img
                src="https://images.unsplash.com/photo-1555066931-4365d14bab8c?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80"
                alt="Programming code on a screen"
                className="w-full h-64 sm:h-96 object-cover rounded-2xl mb-10 shadow-lg"
              />

              <p className="lead text-xl text-gray-600 mb-8">
                For years, developers have struggled to build tools that truly accommodate every user. Today, we are seeing a shift in how web applications handle inclusivity, moving from rigid, closed ecosystems to modular, AI-powered solutions.
              </p>

              <h2 className="text-2xl font-bold mt-12 mb-4">Why Accessibility Matters</h2>
              <p className="mb-6">
                Over 1 billion people globally experience some form of disability. When we build software, we are designing for humanity. If a user cannot read your text because the contrast is too low, or if they cannot navigate a complex form due to motor impairments, they will simply leave.
              </p>

              <p className="mb-6">
                A truly inclusive web requires tools that adapt to the user's specific needs in real-time. Features like <span className="font-semibold text-emerald-600">reading masks</span>, <span className="font-semibold text-emerald-600">text magnifiers</span>, and <span className="font-semibold text-emerald-600">dyslexia-friendly fonts</span> empower users to consume content exactly how they want.
              </p>

              <div className="bg-gray-100 p-8 rounded-2xl my-10 border-l-4 border-emerald-500">
                <h3 className="text-xl font-bold mb-2">Try it out yourself!</h3>
                <p className="mb-4 text-sm text-gray-600">
                  Notice the green floating button in the bottom right corner? That's rafeeq-a11y. Click it to open the menu.
                </p>
                <ul className="list-disc pl-5 space-y-2 text-sm">
                  <li>Try selecting the <strong>Dyslexia Profile</strong> to see the font change.</li>
                  <li>Enable the <strong>Text Magnifier</strong> and hover over this text.</li>
                  <li>Turn on the <strong>Reading Ruler</strong> to help guide your eyes as you scroll.</li>
                  <li>Click the microphone icon and say "Turn on dark mode".</li>
                </ul>
              </div>

              <h2 className="text-2xl font-bold mt-12 mb-4">The Role of Artificial Intelligence</h2>
              <p className="mb-6">
                With the advent of powerful Language Models (LLMs), accessibility widgets no longer need to rely solely on button clicks. A user with motor disabilities can now navigate an entire e-commerce store simply by speaking their intent. The AI parses the context and fires the appropriate DOM events.
              </p>

              <p className="mb-6">
                This isn't science fiction—this is the new standard. And as developers, it is our responsibility to integrate these features gracefully into our products.
              </p>
            </article>

            <hr className="my-12 border-gray-200" />

            {/* Interactive Form Section */}
            <section className="bg-emerald-50 p-8 rounded-3xl border border-emerald-100">
              <h3 className="text-2xl font-bold mb-2">Join the Conversation</h3>
              <p className="text-gray-600 mb-6">Leave your thoughts on web accessibility below.</p>

              <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); alert('Comment posted!'); }}>
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                  <input type="text" id="name" className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-shadow" placeholder="John Doe" required />
                </div>
                <div>
                  <label htmlFor="comment" className="block text-sm font-medium text-gray-700 mb-1">Your Comment</label>
                  <textarea id="comment" rows={4} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-shadow" placeholder="I think this is amazing because..." required></textarea>
                </div>
                <button type="submit" className="px-6 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 font-medium shadow-md transition-all w-full sm:w-auto">
                  Post Comment
                </button>
              </form>
            </section>
          </main>

          {/* Footer */}
          <footer className="border-t border-gray-200 mt-20">
            <div className="max-w-5xl mx-auto px-6 py-12 text-center text-gray-500">
              <p>&copy; 2026 TechDaily. All rights reserved.</p>
            </div>
          </footer>
        </div>
      </div>

      {/* The Widget */}
      <AccessibilityWidget
        triggerPosition="bottom-right"
        triggerColor="#059669"
        isDarkMode={darkMode}
        onThemeChange={setDarkMode}
      />
    </>
  );
}

export default App;
