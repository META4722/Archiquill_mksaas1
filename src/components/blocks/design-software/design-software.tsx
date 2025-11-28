'use client';

import Image from 'next/image';

const designSoftware = [
  {
    id: 1,
    name: 'SketchUp',
    logo: 'https://cdn.prod.website-files.com/62ce5d829e01c60b7c148396/66dad4c95161d0e3376d59a4_655095fdde5933fd6854924d_logo-SketchUp.png',
    description: '3D Modeling',
  },
  {
    id: 2,
    name: 'Rhino',
    logo: 'https://cdn.prod.website-files.com/62ce5d829e01c60b7c148396/66dad4c894101c2581955522_62e652f2a26fe3eaf1a1483f_rhino.webp',
    description: 'CAD Design',
  },
  {
    id: 3,
    name: '3ds Max',
    logo: 'https://cdn.prod.website-files.com/62ce5d829e01c60b7c148396/66dad4c8c3d65d65c06027f8_631f0ccd6e474e25e622ca99_3ds-max-2023-badge-75x75_0.png',
    description: '3D Animation',
  },
  {
    id: 4,
    name: 'Revit',
    logo: 'https://cdn.prod.website-files.com/62ce5d829e01c60b7c148396/66dad4c73ade40b90be17255_631f3b3f6d04e97ebacf760f_revit-2023-badge-75x75.png',
    description: 'BIM Design',
  },
  {
    id: 5,
    name: 'Cinema 4D',
    logo: 'https://cdn.prod.website-files.com/62ce5d829e01c60b7c148396/66dad4c606285571086e1ec1_655095d1e810cddcba3b7a62_logo-CAD.png',
    description: 'Motion Graphics',
  },
];

export default function DesignSoftwareSection() {
  return (
    <div className="bg-background py-12 sm:py-16">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl lg:max-w-none">
          <div className="text-center">
            <h2 className="text-4xl font-semibold tracking-tight text-balance text-foreground sm:text-5xl">
              Turn your design into reality
            </h2>
            <p className="mt-4 text-lg/8 text-muted-foreground">
              Transform concepts from your favorite design software into
              stunning, photorealistic renders with AI-powered precision.
            </p>
          </div>
          <div className="mt-12 grid grid-cols-2 gap-8 md:grid-cols-3 lg:grid-cols-5">
            {designSoftware.map((software) => (
              <div
                key={software.id}
                className="flex flex-col items-center group"
              >
                <div className="relative w-20 h-20 mb-4 transition-transform duration-300 group-hover:scale-110">
                  <Image
                    src={software.logo}
                    alt={`${software.name} logo`}
                    fill
                    sizes="80px"
                    className="object-contain transition-all duration-300"
                    quality={75}
                  />
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-1">
                  {software.name}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {software.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
