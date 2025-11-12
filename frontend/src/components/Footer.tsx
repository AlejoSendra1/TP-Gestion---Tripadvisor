export const Footer = () => {
  return (
    <footer className="bg-card border-t py-12">
        <div className="container mx-auto px-4">
            <div className="text-center">
                <div className="flex items-center justify-center">
                    <img className="w-48 h-24 " src="/letrassinfondo.png" />
                </div>
                <p className="text-muted-foreground mb-4">
                    Viajá, contá tu historia y desbloqueá recompensas!
                </p>
                <div className="flex justify-center space-x-6 text-sm text-muted-foreground">
                    <a href="#" className="hover:text-primary transition-colors">Nosotros</a>
                    <a href="#" className="hover:text-primary transition-colors">Centro de Ayuda</a>
                    <a href="#" className="hover:text-primary transition-colors">Privacidad</a>
                    <a href="#" className="hover:text-primary transition-colors">Términos y Condiciones</a>
                </div>
            </div>
        </div>
    </footer>
  );
};

export default Footer;