<?php

return [
    'required' => 'Le champ :attribute est requis.',
    'string' => 'Le :attribute doit être une chaîne de caractères.',
    'numeric' => 'Le :attribute doit être un nombre.',
    'integer' => 'Le :attribute doit être un entier.',
    'boolean' => 'Le :attribute doit être vrai ou faux.',
    'array' => 'Le :attribute doit être un tableau.',
    'unique' => 'Le :attribute a déjà été pris.',
    'exists' => 'Le :attribute sélectionné est invalide.',
    'min' => [
        'numeric' => 'Le :attribute doit être au moins :min.',
        'array' => 'Le :attribute doit contenir au moins :min éléments.',
    ],
    'max' => [
        'numeric' => 'Le :attribute ne peut pas être supérieur à :max.',
    ],
    'size' => [
        'numeric' => 'Le :attribute doit contenir exactement :size élément(s).',
    ],
    'custom' => [
        'latitude' => [
            'min' => 'La latitude doit être entre -90 et 90.',
            'max' => 'La latitude doit être entre -90 et 90.',
        ],
        'longitude' => [
            'min' => 'La longitude doit être entre -180 et 180.',
            'max' => 'La longitude doit être entre -180 et 180.',
        ],
        'zoom' => [
            'min' => 'Le zoom doit être entre 0 et 22.',
            'max' => 'Le zoom doit être entre 0 et 22.',
        ],
    ],
    'attributes' => [
        'slug' => 'slug de la région',
        'latitude' => 'latitude',
        'longitude' => 'longitude',
        'zoom' => 'zoom',
        'is_published' => 'statut de publication',
        'translations' => 'traductions',
        'translations.0.language_code' => 'code de langue',
        'translations.0.name' => 'nom de la région',
        'translations.0.description' => 'description',
        'translations.0.image' => 'image',
        'translations.0.Total_Population' => 'population totale',
        'translations.0.Area' => 'superficie',
        'translations.0.Number_Provinces' => 'nombre de provinces',
        'translations.0.Numbrer_Communes' => 'nombre de communes',
        'translations.0.Urbanization_Rate' => 'taux d’urbanisation',
        'sections' => 'sections',
        'sections.*.slug' => 'slug de la section',
        'sections.*.order' => 'ordre de la section',
        'sections.*.translations' => 'traductions de la section',
        'sections.*.translations.0.language_code' => 'code de langue de la section',
        'sections.*.translations.0.title' => 'titre de la section',
        'sections.*.translations.0.content' => 'contenu de la section',
        'sections.*.translations.0.image' => 'image de la section',
    ],
];