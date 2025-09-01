import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Check } from 'lucide-react';

const HomePage: React.FC = () => {
  return (
    <div>
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-primary/90 to-secondary/90 text-white">
        <div className="container mx-auto px-4 py-20">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div>
              <h1 className="text-4xl md:text-5xl font-bold mb-6">
                Créez sans limite, sans code
              </h1>
              <p className="text-xl mb-8 text-white/90">
                Auto Créateur permet à tout le monde de créer des sites internet, des tunnels de vente, des formations, des webinaires, sans compétences techniques particulières.
              </p>
              <div className="flex flex-wrap gap-4">
                <Link to="/tools" className="btn bg-white text-primary hover:bg-white/90">
                  Découvrir nos outils
                </Link>
                <Link to="/register" className="btn bg-transparent border-2 border-white text-white hover:bg-white/10">
                  S'inscrire gratuitement
                </Link>
              </div>
            </div>
            <div className="hidden md:block">
              <img 
                src="https://images.pexels.com/photos/3183150/pexels-photo-3183150.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2" 
                alt="Création de site web" 
                className="rounded-lg shadow-xl w-full h-auto"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Tout ce dont vous avez besoin pour créer en ligne</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Autocréateur regroupe les meilleurs outils pour créer facilement des sites internet performants, les faire évoluer et les promouvoir sur les réseaux sociaux.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-8 rounded-lg shadow-md">
              <div className="h-14 w-14 bg-primary/10 rounded-lg flex items-center justify-center mb-6">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-3">Sites web et tunnels de vente</h3>
              <p className="text-gray-600 mb-4">
                Créez des sites internet de présentation, des boutiques en ligne, et des tunnels de vente optimisés pour les conversions.
              </p>
              <Link to="/tools" className="text-primary font-medium inline-flex items-center hover:underline">
                Découvrir <ArrowRight size={16} className="ml-1" />
              </Link>
            </div>

            <div className="bg-white p-8 rounded-lg shadow-md">
              <div className="h-14 w-14 bg-primary/10 rounded-lg flex items-center justify-center mb-6">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-3">Webinaires et formations</h3>
              <p className="text-gray-600 mb-4">
                Proposez des webinaires engageants et créez des formations en ligne complètes pour partager votre expertise.
              </p>
              <Link to="/tools" className="text-primary font-medium inline-flex items-center hover:underline">
                Découvrir <ArrowRight size={16} className="ml-1" />
              </Link>
            </div>

            <div className="bg-white p-8 rounded-lg shadow-md">
              <div className="h-14 w-14 bg-primary/10 rounded-lg flex items-center justify-center mb-6">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-3">Contenu marketing</h3>
              <p className="text-gray-600 mb-4">
                Générez des scripts vidéo, des posts pour les réseaux sociaux, des emails marketing et des lead magnets.
              </p>
              <Link to="/tools" className="text-primary font-medium inline-flex items-center hover:underline">
                Découvrir <ArrowRight size={16} className="ml-1" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Tools Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Des outils professionnels au meilleur prix</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Accédez à une suite complète d'outils avec le meilleur rapport qualité/prix, sans engagement de durée.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-white p-8 rounded-lg shadow-md border border-gray-100">
              <h3 className="text-xl font-semibold mb-6">Outils partenaires</h3>
              <ul className="space-y-4">
                <li className="flex items-start">
                  <Check size={20} className="text-green-500 mr-3 mt-1 flex-shrink-0" />
                  <div>
                    <p className="font-medium">BUILDERALL</p>
                    <p className="text-gray-600">CMS tout en un boosté à l'IA, très simple d'utilisation et très performant.</p>
                  </div>
                </li>
                <li className="flex items-start">
                  <Check size={20} className="text-green-500 mr-3 mt-1 flex-shrink-0" />
                  <div>
                    <p className="font-medium">SYSTEME IO</p>
                    <p className="text-gray-600">Outil de marketing tout en un pour réaliser vos tunnels de vente et vos formations en ligne.</p>
                  </div>
                </li>
                <li className="flex items-start">
                  <Check size={20} className="text-green-500 mr-3 mt-1 flex-shrink-0" />
                  <div>
                    <p className="font-medium">LWS</p>
                    <p className="text-gray-600">Hébergeur français et fournisseur de noms de domaines avec garantie satisfait ou remboursé.</p>
                  </div>
                </li>
                <li className="flex items-start">
                  <Check size={20} className="text-green-500 mr-3 mt-1 flex-shrink-0" />
                  <div>
                    <p className="font-medium">SYNTHESYS</p>
                    <p className="text-gray-600">IA génératrice de vidéos avec avatar personnalisable et doublage de vidéos.</p>
                  </div>
                </li>
              </ul>
              <div className="mt-8">
                <Link to="/tools" className="btn btn-primary w-full">Voir tous les outils partenaires</Link>
              </div>
            </div>

            <div className="bg-white p-8 rounded-lg shadow-md border border-gray-100">
              <h3 className="text-xl font-semibold mb-6">Générateurs de contenu</h3>
              <ul className="space-y-4">
                <li className="flex items-start">
                  <Check size={20} className="text-green-500 mr-3 mt-1 flex-shrink-0" />
                  <div>
                    <p className="font-medium">Générateur de scripts vidéo</p>
                    <p className="text-gray-600">Créez des scripts captivants pour vos vidéos YouTube, longs formats et shorts.</p>
                  </div>
                </li>
                <li className="flex items-start">
                  <Check size={20} className="text-green-500 mr-3 mt-1 flex-shrink-0" />
                  <div>
                    <p className="font-medium">Générateur de posts et d'emails</p>
                    <p className="text-gray-600">Concevez des emails de vente percutants et des posts engageants pour les réseaux sociaux.</p>
                  </div>
                </li>
                <li className="flex items-start">
                  <Check size={20} className="text-green-500 mr-3 mt-1 flex-shrink-0" />
                  <div>
                    <p className="font-medium">Générateur de lead magnets</p>
                    <p className="text-gray-600">Créez des lead magnets attractifs pour capturer des emails efficacement.</p>
                  </div>
                </li>
                <li className="flex items-start">
                  <Check size={20} className="text-green-500 mr-3 mt-1 flex-shrink-0" />
                  <div>
                    <p className="font-medium">Générateur de formations</p>
                    <p className="text-gray-600">Développez des formations complètes en plusieurs modules sur le sujet de votre choix.</p>
                  </div>
                </li>
              </ul>
              <div className="mt-8">
                <Link to="/tools" className="btn btn-primary w-full">Découvrir les générateurs</Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Formation Banner */}
      <section className="py-16 bg-secondary text-white">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="mb-8 md:mb-0 md:mr-8">
              <h2 className="text-3xl font-bold mb-4">Formation Réussite Online</h2>
              <p className="text-xl text-white/90 max-w-2xl">
                Découvrez comment créer un business en ligne rémunérateur, sans risques, sans connaissances techniques particulières, sans investissements lourds.
              </p>
            </div>
            <a 
              href="https://reussite.online" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="btn bg-white text-secondary hover:bg-white/90 px-8 py-3 text-lg"
            >
              En savoir plus
            </a>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Ils nous font confiance</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Découvrez ce que nos utilisateurs disent de nos outils et services.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-8 rounded-lg shadow-md">
              <div className="flex items-center mb-4">
                <div className="flex text-amber-400">
                  {[...Array(5)].map((_, i) => (
                    <svg key={i} xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118l-2.8-2.034c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
              </div>
              <p className="text-gray-600 mb-4">
                "Grâce à Auto Créateur, j'ai pu créer mon site e-commerce en moins d'une semaine, sans aucune connaissance en développement. Les outils sont intuitifs et le support est excellent."
              </p>
              <div>
                <p className="font-semibold">Sophie Martin</p>
                <p className="text-gray-500">Entrepreneur</p>
              </div>
            </div>

            <div className="bg-white p-8 rounded-lg shadow-md">
              <div className="flex items-center mb-4">
                <div className="flex text-amber-400">
                  {[...Array(5)].map((_, i) => (
                    <svg key={i} xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118l-2.8-2.034c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
              </div>
              <p className="text-gray-600 mb-4">
                "Les générateurs de contenu sont exceptionnels. J'ai pu créer une formation complète et des scripts vidéo de qualité professionnelle en quelques heures seulement."
              </p>
              <div>
                <p className="font-semibold">Thomas Durand</p>
                <p className="text-gray-500">Formateur</p>
              </div>
            </div>

            <div className="bg-white p-8 rounded-lg shadow-md">
              <div className="flex items-center mb-4">
                <div className="flex text-amber-400">
                  {[...Array(5)].map((_, i) => (
                    <svg key={i} xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118l-2.8-2.034c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
              </div>
              <p className="text-gray-600 mb-4">
                "Le rapport qualité/prix est imbattable. J'ai comparé avec d'autres solutions et Auto Créateur offre bien plus de fonctionnalités pour un prix bien inférieur."
              </p>
              <div>
                <p className="font-semibold">Pierre Lefebvre</p>
                <p className="text-gray-500">Consultant marketing</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-primary/90 to-secondary/90 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">Prêt à créer sans limite ?</h2>
          <p className="text-xl text-white/90 max-w-3xl mx-auto mb-8">
            Inscrivez-vous gratuitement et recevez 100 tickets pour tester nos outils de génération de contenu.
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Link to="/register" className="btn bg-white text-primary hover:bg-white/90 px-8 py-3 text-lg">
              S'inscrire gratuitement
            </Link>
            <Link to="/tools" className="btn bg-transparent border-2 border-white text-white hover:bg-white/10 px-8 py-3 text-lg">
              Découvrir les outils
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;