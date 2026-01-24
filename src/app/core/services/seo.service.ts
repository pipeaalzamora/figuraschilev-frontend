import { Injectable, inject } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';
import { Figura } from '../models/figura.model';

@Injectable({
  providedIn: 'root'
})
export class SeoService {
  private meta = inject(Meta);
  private title = inject(Title);

  setDefaultTags(): void {
    this.title.setTitle('FigurasChileV - Colección de Figuras y Tesoros de Ferias');
    this.meta.updateTag({ name: 'description', content: 'Explora mi colección personal de figuras de anime, películas, series y más. Tesoros encontrados en ferias de Valparaíso, Viña del Mar, Villa Alemana y Quilpué.' });
    this.meta.updateTag({ name: 'keywords', content: 'figuras, colección, anime, ferias, Valparaíso, Viña del Mar, Chile, coleccionables' });
    
    // Open Graph
    this.meta.updateTag({ property: 'og:title', content: 'FigurasChileV - Colección de Figuras' });
    this.meta.updateTag({ property: 'og:description', content: 'Explora mi colección personal de figuras y tesoros de ferias' });
    this.meta.updateTag({ property: 'og:type', content: 'website' });
    this.meta.updateTag({ property: 'og:image', content: '/logo-figuraschilev.png' });
    
    // Twitter Card
    this.meta.updateTag({ name: 'twitter:card', content: 'summary_large_image' });
    this.meta.updateTag({ name: 'twitter:title', content: 'FigurasChileV - Colección de Figuras' });
    this.meta.updateTag({ name: 'twitter:description', content: 'Explora mi colección personal de figuras y tesoros de ferias' });
    this.meta.updateTag({ name: 'twitter:image', content: '/logo-figuraschilev.png' });
  }

  setFiguraTags(figura: Figura): void {
    const title = `${figura.nombre} - FigurasChileV`;
    const description = figura.descripcionLarga || figura.descripcionCorta || `${figura.nombre} - Figura de ${figura.categoria || 'colección'}`;
    const price = `$${figura.precio.toLocaleString('es-CL')}`;
    
    this.title.setTitle(title);
    this.meta.updateTag({ name: 'description', content: description });
    this.meta.updateTag({ name: 'keywords', content: `${figura.nombre}, ${figura.categoria}, figura, colección, ${figura.lugarCompra}` });
    
    // Open Graph
    this.meta.updateTag({ property: 'og:title', content: title });
    this.meta.updateTag({ property: 'og:description', content: `${description} - ${price}` });
    this.meta.updateTag({ property: 'og:type', content: 'product' });
    this.meta.updateTag({ property: 'og:image', content: figura.imagenPrincipal });
    this.meta.updateTag({ property: 'og:price:amount', content: figura.precio.toString() });
    this.meta.updateTag({ property: 'og:price:currency', content: 'CLP' });
    
    // Twitter Card
    this.meta.updateTag({ name: 'twitter:card', content: 'summary_large_image' });
    this.meta.updateTag({ name: 'twitter:title', content: title });
    this.meta.updateTag({ name: 'twitter:description', content: `${description} - ${price}` });
    this.meta.updateTag({ name: 'twitter:image', content: figura.imagenPrincipal });
    
    // Schema.org JSON-LD
    this.setProductSchema(figura);
  }

  private setProductSchema(figura: Figura): void {
    const schema = {
      '@context': 'https://schema.org',
      '@type': 'Product',
      'name': figura.nombre,
      'description': figura.descripcionLarga || figura.descripcionCorta,
      'image': figura.imagenPrincipal,
      'offers': {
        '@type': 'Offer',
        'price': figura.precio,
        'priceCurrency': 'CLP',
        'availability': 'https://schema.org/InStock'
      },
      'category': figura.categoria
    };

    // Remover script anterior si existe
    const existingScript = document.getElementById('product-schema');
    if (existingScript) {
      existingScript.remove();
    }

    // Agregar nuevo script
    const script = document.createElement('script');
    script.id = 'product-schema';
    script.type = 'application/ld+json';
    script.text = JSON.stringify(schema);
    document.head.appendChild(script);
  }
}
