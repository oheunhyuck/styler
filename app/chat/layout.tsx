export default function ChatLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      {/* Hide the website Navbar — chat page has its own sidebar */}
      <style dangerouslySetInnerHTML={{ __html: 'body > nav { display: none !important; }' }} />
      {children}
    </>
  );
}
