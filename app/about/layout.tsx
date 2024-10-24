import Footer from "../footer";
import Header from "../header";

export default function AboutLayout({
  children, // will be a page or nested layout
}: {
  children: React.ReactNode
}) {
  return (
    <section>
      {/* Include shared UI here e.g. a header or sidebar */}
      <Header />
      {children}
      <Footer />
    </section>
  )
}