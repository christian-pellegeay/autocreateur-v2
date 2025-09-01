import React from 'react';

const LegalPage: React.FC = () => {
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-8">Mentions légales</h1>
        
        <div className="space-y-8">
          <section>
            <h2 className="text-2xl font-semibold mb-4">1. Présentation du site</h2>
            <p className="mb-4">
              Conformément aux dispositions des articles 6-III et 19 de la Loi n° 2004-575 du 21 juin 2004 pour la Confiance dans l'économie numérique, dite L.C.E.N., nous portons à la connaissance des utilisateurs et visiteurs du site autocreateur.fr les informations suivantes :
            </p>
            
            <h3 className="text-xl font-semibold mb-2">Informations légales :</h3>
            <ul className="list-disc list-inside space-y-1 mb-4">
              <li>Statut du propriétaire : Auto-entrepreneur</li>
              <li>Prénom : Elena</li>
              <li>Nom : Pellegeay</li>
              <li>Adresse : 33 Grande Rue Verte, 78610 LE PERRAY EN YVELINES</li>
              <li>Tél : +33 (0)9 72 63 88 37</li>
              <li>Mobile : +33 (0)6 18 85 21 66</li>
              <li>SIRET : [Numéro SIRET]</li>
              <li>Adresse de courrier électronique : contact@reussite.online</li>
            </ul>
            
            <p>
              Le Créateur du site est : C.Pellegeay<br />
              Le Responsable de la publication est : Elena Pellegeay<br />
              Contactez le responsable de la publication : contact@reussite.online<br />
              Le responsable de la publication est une personne physique<br />
              Le Webmaster est : C.Pellegeay<br />
              Contactez le Webmaster : contact@reussite.online<br />
              L'hébergeur du site est : [Nom et adresse de l'hébergeur]
            </p>
          </section>
          
          <section>
            <h2 className="text-2xl font-semibold mb-4">2. Conditions générales d'utilisation du site et des services proposés</h2>
            <p className="mb-4">
              L'utilisation du site autocreateur.fr implique l'acceptation pleine et entière des conditions générales d'utilisation décrites ci-après. Ces conditions d'utilisation sont susceptibles d'être modifiées ou complétées à tout moment, sans préavis, aussi les utilisateurs du site autocreateur.fr sont invités à les consulter de manière régulière.
            </p>
            <p className="mb-4">
              Ce site est normalement accessible à tout moment aux utilisateurs. Une interruption pour raison de maintenance technique peut être toutefois décidée par Elena Pellegeay.
            </p>
            <p>
              Le site autocreateur.fr est mis à jour régulièrement par le propriétaire. De la même façon, les mentions légales peuvent être modifiées à tout moment : elles s'imposent néanmoins à l'utilisateur qui est invité à s'y référer le plus souvent possible afin d'en prendre connaissance.
            </p>
          </section>
          
          <section>
            <h2 className="text-2xl font-semibold mb-4">3. Description des services fournis</h2>
            <p className="mb-4">
              Le site autocreateur.fr a pour objet de fournir une information concernant l'ensemble des activités de la société.
            </p>
            <p className="mb-4">
              Elena Pellegeay s'efforce de fournir sur le site autocreateur.fr des informations aussi précises que possible. Toutefois, elle ne pourra être tenue responsable des omissions, des inexactitudes et des carences dans la mise à jour, qu'elles soient de son fait ou du fait des tiers partenaires qui lui fournissent ces informations.
            </p>
            <p>
              Toutes les informations proposées sur le site autocreateur.fr sont données à titre indicatif, sont non exhaustives, et sont susceptibles d'évoluer. Elles sont données sous réserve de modifications ayant été apportées depuis leur mise en ligne.
            </p>
          </section>
          
          <section>
            <h2 className="text-2xl font-semibold mb-4">4. Limitations contractuelles sur les données techniques</h2>
            <p className="mb-4">
              Le site utilise la technologie JavaScript.
            </p>
            <p>
              Le site Internet ne pourra être tenu responsable de dommages matériels liés à l'utilisation du site. De plus, l'utilisateur du site s'engage à accéder au site en utilisant un matériel récent, ne contenant pas de virus et avec un navigateur de dernière génération mis à jour.
            </p>
          </section>
          
          <section>
            <h2 className="text-2xl font-semibold mb-4">5. Propriété intellectuelle et contrefaçons</h2>
            <p className="mb-4">
              Elena Pellegeay est propriétaire des droits de propriété intellectuelle ou détient les droits d'usage sur tous les éléments accessibles sur le site, notamment les textes, images, graphismes, logo, icônes, sons, logiciels, etc.
            </p>
            <p className="mb-4">
              Toute reproduction, représentation, modification, publication, adaptation totale ou partielle des éléments du site, quel que soit le moyen ou le procédé utilisé, est interdite, sauf autorisation écrite préalable d'Elena Pellegeay.
            </p>
            <p>
              Toute exploitation non autorisée du site ou de l'un quelconque de ces éléments qu'il contient sera considérée comme constitutive d'une contrefaçon et poursuivie conformément aux dispositions des articles L.335-2 et suivants du Code de Propriété Intellectuelle.
            </p>
          </section>
          
          <section>
            <h2 className="text-2xl font-semibold mb-4">6. TVA</h2>
            <p>
              TVA non applicable, Art. 293 B du CGI.
            </p>
          </section>
          
          <section>
            <h2 className="text-2xl font-semibold mb-4">7. Contact</h2>
            <p>
              Pour toute question ou information, vous pouvez nous contacter :<br />
              Email : contact@reussite.online<br />
              Téléphone : +33 (0)9 72 63 88 37<br />
              Mobile : +33 (0)6 18 85 21 66<br />
              Adresse : 33 Grande Rue Verte, 78610 LE PERRAY EN YVELINES, France
            </p>
          </section>
        </div>
      </div>
    </div>
  );
};

export default LegalPage;