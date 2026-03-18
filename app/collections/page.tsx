import Image from 'next/image'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Header } from '@/components/header'

const collections = [
  {
    id: 1,
    name: 'Timeless Classics',
    description: 'Our signature collection of enduring fragrances that stand the test of time.',
    image: '/hero-banner.jpg',
    featured: true,
  },
  {
    id: 2,
    name: 'Fresh Essence',
    description: 'Light and refreshing fragrances perfect for everyday wear.',
    image: '/hero-banner.jpg',
    featured: false,
  },
  {
    id: 3,
    name: 'Evening Elegance',
    description: 'Sophisticated fragrances designed for special occasions.',
    image: '/hero-banner.jpg',
    featured: false,
  },
  {
    id: 4,
    name: 'Oriental Dreams',
    description: 'Exotic and luxurious fragrances with warm, sensual notes.',
    image: '/hero-banner.jpg',
    featured: false,
  },
]

export default function CollectionsPage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />

      {/* Hero */}
      <section className="border-b border-border py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <h1 className="font-serif text-5xl text-foreground mb-4">
            Collections
          </h1>
          <p className="text-lg text-foreground/60 max-w-2xl">
            Explore our curated fragrance collections, each carefully designed to capture different moments and moods.
          </p>
        </div>
      </section>

      {/* Collections Grid */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="space-y-12">
            {collections.map((collection, idx) => (
              <div
                key={collection.id}
                className={`grid grid-cols-1 lg:grid-cols-2 gap-12 items-center ${
                  idx % 2 === 1 ? 'lg:grid-flow-dense' : ''
                }`}
              >
                {/* Image */}
                <div className={`relative h-96 rounded-lg overflow-hidden bg-muted ${idx % 2 === 1 ? 'lg:col-start-2' : ''}`}>
                  <Image
                    src={collection.image}
                    alt={collection.name}
                    fill
                    className="object-cover"
                  />
                </div>

                {/* Content */}
                <div className="space-y-6">
                  <div>
                    {collection.featured && (
                      <p className="text-sm font-medium text-accent uppercase tracking-wide mb-2">
                        Featured Collection
                      </p>
                    )}
                    <h2 className="font-serif text-4xl text-foreground mb-4">
                      {collection.name}
                    </h2>
                    <p className="text-lg text-foreground/70">
                      {collection.description}
                    </p>
                  </div>

                  <Button size="lg" asChild>
                    <Link href="/shop">
                      Explore Collection
                    </Link>
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}
