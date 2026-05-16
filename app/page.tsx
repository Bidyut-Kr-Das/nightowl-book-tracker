"use client";

import { useState, useCallback } from "react";
import { motion } from "motion/react";
import Navbar from "@/components/navbar";
import HeroSection from "@/components/hero-section";
import AmbientParticles from "@/components/ambient-particles";
import ReadingStats from "@/components/reading-stats";
import BookShelfRow from "@/components/book-shelf-row";
import BookDetailModal from "@/components/book-detail-modal";
import SearchFilter from "@/components/search-filter";
import RecentlyAdded from "@/components/recently-added";
import BookCard from "@/components/book-card";
import { getBooksByStatus, type Book } from "@/lib/books-data";
import { Library } from "lucide-react";

export default function HomePage() {
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchResults, setSearchResults] = useState<Book[]>([]);

  const currentlyReading = getBooksByStatus("reading");
  const completed = getBooksByStatus("completed");
  const wishlist = getBooksByStatus("wishlist");

  const handleSelectBook = useCallback((book: Book) => {
    setSelectedBook(book);
    setIsModalOpen(true);
  }, []);

  const handleCloseModal = useCallback(() => {
    setIsModalOpen(false);
    // Delay clearing book for exit animation
    setTimeout(() => setSelectedBook(null), 350);
  }, []);

  const handleSearchResults = useCallback((books: Book[]) => {
    setSearchResults(books);
  }, []);

  // Wrap entire landing page in .dark scope so it always renders
  // in dark mode regardless of global theme — no useEffect flash
  return (
    <div className="dark bg-background text-foreground min-h-screen">
      <AmbientParticles />
      <Navbar onSearchToggle={() => setIsSearchOpen((prev) => !prev)} />

      <main className="relative z-10">
        {/* Hero */}
        <HeroSection />

        {/* Content area */}
        <div className="max-w-7xl mx-auto px-5 md:px-8 pb-32">
          {/* Search & Filter */}
          <motion.div
            className="mb-12"
            id="library"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <SearchFilter
              onResultsChange={handleSearchResults}
              isOpen={isSearchOpen}
              onToggle={() => setIsSearchOpen((prev) => !prev)}
            />
          </motion.div>

          {/* Search results — shown when filters are active */}
          {isSearchOpen && searchResults.length > 0 && (
            <motion.section
              className="mb-16"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, ease: [0.23, 1, 0.32, 1] }}
            >
              <div className="flex items-center gap-3 mb-6">
                <Library size={18} className="text-lamp/60" />
                <h2 className="text-xl font-light tracking-tight font-[family-name:var(--font-display)]">
                  Search Results
                </h2>
              </div>
              <div className="flex flex-wrap gap-6 md:gap-8">
                {searchResults.map((book, i) => (
                  <BookCard
                    key={book.id}
                    book={book}
                    index={i}
                    onSelect={handleSelectBook}
                    size="md"
                  />
                ))}
              </div>
            </motion.section>
          )}

          {/* Reading Stats */}
          <motion.div
            className="mb-16"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true, margin: "-50px" }}
          >
            <ReadingStats />
          </motion.div>

          {/* Currently Reading Shelf */}
          <div className="mb-16" id="reading">
            <BookShelfRow
              title="Currently Reading"
              subtitle={`${currentlyReading.length} books in progress`}
              books={currentlyReading}
              onSelectBook={handleSelectBook}
              bookSize="lg"
            />
          </div>

          {/* Completed Shelf */}
          <div className="mb-16" id="completed">
            <BookShelfRow
              title="Completed"
              subtitle={`${completed.length} books finished`}
              books={completed}
              onSelectBook={handleSelectBook}
              bookSize="md"
            />
          </div>

          {/* Wishlist Shelf */}
          <div className="mb-16" id="wishlist">
            <BookShelfRow
              title="Wishlist"
              subtitle={`${wishlist.length} books waiting`}
              books={wishlist}
              onSelectBook={handleSelectBook}
              bookSize="md"
            />
          </div>

          {/* Two-column: Recently Added + Reading Progress Detail */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
            {/* Recently Added */}
            <RecentlyAdded onSelectBook={handleSelectBook} />

            {/* Reading Progress Detail */}
            <motion.section
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.6 }}
            >
              <div className="flex items-baseline gap-3 mb-5">
                <h2 className="text-2xl md:text-3xl font-light tracking-tight font-[family-name:var(--font-display)]">
                  Reading Progress
                </h2>
                <div className="flex-1 h-px bg-border ml-4 hidden sm:block" />
              </div>

              <div className="space-y-5">
                {currentlyReading.map((book, i) => (
                  <motion.div
                    key={book.id}
                    className="relative rounded-xl p-4 cursor-pointer group"
                    style={{
                      background: "oklch(1 0 0 / 3%)",
                      border: "1px solid oklch(1 0 0 / 5%)",
                    }}
                    initial={{ opacity: 0, y: 10 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{
                      delay: i * 0.1,
                      duration: 0.4,
                      ease: [0.23, 1, 0.32, 1],
                    }}
                    whileHover={{
                      y: -2,
                      transition: { duration: 0.2 },
                    }}
                    whileTap={{ scale: 0.99 }}
                    onClick={() => handleSelectBook(book)}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <p className="text-sm font-medium group-hover:text-lamp transition-colors">
                          {book.title}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {book.author}
                        </p>
                      </div>
                      <span className="text-2xl font-light font-[family-name:var(--font-display)] text-lamp">
                        {book.progress}%
                      </span>
                    </div>

                    {/* Progress bar */}
                    <div className="h-1.5 rounded-full bg-white/5 overflow-hidden">
                      <motion.div
                        className="h-full rounded-full"
                        style={{
                          background:
                            "linear-gradient(90deg, oklch(0.82 0.12 70), oklch(0.72 0.15 40))",
                        }}
                        initial={{ width: 0 }}
                        whileInView={{
                          width: `${book.progress}%`,
                        }}
                        viewport={{ once: true }}
                        transition={{
                          delay: 0.3 + i * 0.15,
                          duration: 1,
                          ease: [0.23, 1, 0.32, 1],
                        }}
                      />
                    </div>

                    <div className="flex items-center justify-between mt-2">
                      <span className="text-[11px] text-muted-foreground/60">
                        Page {book.currentPage} of {book.totalPages}
                      </span>
                      <span className="text-[11px] text-muted-foreground/60">
                        ~{Math.ceil(((book.totalPages! - book.currentPage!) / 30))} days left
                      </span>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.section>
          </div>
        </div>

        {/* Footer */}
        <footer className="border-t border-border py-12">
          <div className="max-w-7xl mx-auto px-5 md:px-8 text-center">
            <p className="text-sm text-muted-foreground/50">
              <span className="font-[family-name:var(--font-display)] text-base">
                NightOwl
              </span>{" "}
              — crafted for readers who love beautiful things
            </p>
          </div>
        </footer>
      </main>

      {/* Book Detail Modal */}
      <BookDetailModal
        book={selectedBook}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
      />
    </div>
  );
}
