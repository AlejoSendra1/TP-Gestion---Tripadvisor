export const Footer = () => {
  return (
    <footer className="bg-card border-t py-12">
        <div className="container mx-auto px-4">
            <div className="text-center">
                <div className="flex items-center justify-center">
                    <img className="w-48 h-24 " src="/letrassinfondo.png" />
                </div>
                <p className="text-muted-foreground mb-4">
                    Discover amazing places, share your experiences, and earn XP rewards
                </p>
                <div className="flex justify-center space-x-6 text-sm text-muted-foreground">
                    <a href="#" className="hover:text-primary transition-colors">About</a>
                    <a href="#" className="hover:text-primary transition-colors">Help</a>
                    <a href="#" className="hover:text-primary transition-colors">Privacy</a>
                    <a href="#" className="hover:text-primary transition-colors">Terms</a>
                </div>
            </div>
        </div>
    </footer>
  );
};

export default Footer;