import React, { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { Link } from 'react-router-dom';

interface FaqItem {
  question: string;
  answer: string;
}

const FaqPage: React.FC = () => {
  const [openItem, setOpenItem] = useState<number | null>(0);
  
  const faqItems: FaqItem[] = [
    {
      question: "Qu'est-ce que Auto Créateur ?",
      answer: "Auto Créateur est une plateforme qui permet à tout le monde de créer des sites internet, des tunnels de vente, des formations, des webinaires, sans compétences techniques particulières, sans connaître les langages informatiques, avec le meilleur rapport qualité/prix. Tous ces outils sont sans engagement de durée."
    },
    {
      question: "Comment fonctionnent les tickets ?",
      answer: "Les tickets sont utilisés pour accéder à nos outils de génération de contenu. Chaque outil a un coût spécifique en tickets. Lorsque vous créez un compte, vous recevez 100 tickets gratuits. Vous pouvez ensuite acheter des packs de tickets supplémentaires selon vos besoins."
    },
    {
      question: "Les tickets ont-ils une date d'expiration ?",
      answer: "Non, les tickets n'ont pas de date d'expiration. Vous pouvez les utiliser quand vous le souhaitez."
    },
    {
      question: "Comment fonctionnent les liens d'affiliation ?",
      answer: "Les liens d'affiliation vous permettent d'accéder à des outils partenaires sans surcoût pour vous. Certains liens offrent des gratuités supplémentaires ou sont assortis de codes de réduction. En utilisant ces liens, vous soutenez Auto Créateur qui reçoit une commission de la part du partenaire."
    },
    {
      question: "Puis-je utiliser les générateurs de contenu pour un usage commercial ?",
      answer: "Oui, tout le contenu généré par nos outils peut être utilisé à des fins commerciales. Vous êtes propriétaire du contenu généré."
    },
    {
      question: "Comment fonctionne l'outil de validation des vidéos ?",
      answer: "Cet outil vous permet de traiter un fichier XLSX contenant des liens vers des vidéos YouTube. Vous pouvez visualiser chaque vidéo et décider de la conserver ou de la supprimer du fichier. À la fin, vous obtenez un nouveau fichier XLSX contenant uniquement les vidéos validées."
    },
    {
      question: "Puis-je obtenir un remboursement si je ne suis pas satisfait ?",
      answer: "Les tickets achetés ne sont pas remboursables. Nous vous encourageons à utiliser vos tickets gratuits pour tester nos outils avant d'acheter des tickets supplémentaires."
    },
    {
      question: "Comment puis-je contacter le support ?",
      answer: "Vous pouvez nous contacter par email à contact@reussite.online ou par téléphone au +33 (0)9 72 63 88 37. Nous sommes disponibles du lundi au vendredi de 9h à 18h."
    },
    {
      question: "Qu'est-ce que la formation Réussite Online ?",
      answer: "Réussite Online est une formation qui vous donne toutes les clés pour créer vos sites internet et les promouvoir sans risque, sans investissements conséquents et quelque soit vos connaissances en informatiques. Vous pouvez en savoir plus sur https://reussite.online"
    },
    {
      question: "Les outils sont-ils disponibles dans d'autres langues que le français ?",
      answer: "Actuellement, notre plateforme et nos outils sont uniquement disponibles en français. Nous travaillons sur des versions dans d'autres langues pour l'avenir."
    }
  ];
  
  const toggleItem = (index: number) => {
    setOpenItem(openItem === index ? null : index);
  };
  
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-4xl font-bold mb-8 text-center">Foire Aux Questions</h1>
        
        <div className="space-y-4">
          {faqItems.map((item, index) => (
            <div 
              key={index} 
              className="border border-gray-200 rounded-lg overflow-hidden"
            >
              <button
                className="w-full px-6 py-4 text-left flex justify-between items-center focus:outline-none"
                onClick={() => toggleItem(index)}
              >
                <span className="text-lg font-medium">{item.question}</span>
                {openItem === index ? (
                  <ChevronUp className="h-5 w-5 text-gray-500" />
                ) : (
                  <ChevronDown className="h-5 w-5 text-gray-500" />
                )}
              </button>
              
              {openItem === index && (
                <div className="px-6 py-4 bg-gray-50">
                  <p className="text-gray-700">{item.answer}</p>
                </div>
              )}
            </div>
          ))}
        </div>
        
        <div className="mt-12 text-center">
          <p className="text-gray-600 mb-4">
            Vous n'avez pas trouvé de réponse à votre question ?
          </p>
          <Link 
            to="/contact" 
            className="btn btn-primary"
          >
            Contactez-nous
          </Link>
        </div>
      </div>
    </div>
  );
};

export default FaqPage;