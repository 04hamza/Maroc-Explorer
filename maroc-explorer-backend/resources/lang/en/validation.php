<?php

return [
    'required' => 'The :attribute field is required.',
    'string' => 'The :attribute must be a string.',
    'numeric' => 'The :attribute must be a number.',
    'integer' => 'The :attribute must be an integer.',
    'boolean' => 'The :attribute must be true or false.',
    'array' => 'The :attribute must be an array.',
    'unique' => 'The :attribute has already been taken.',
    'exists' => 'The selected :attribute is invalid.',
    'min' => [
        'numeric' => 'The :attribute must be at least :min.',
        'array' => 'The :attribute must have at least :min items.',
    ],
    'max' => [
        'numeric' => 'The :attribute may not be greater than :max.',
    ],
    'size' => [
        'numeric' => 'The :attribute must contain exactly :size item(s).',
    ],
    'custom' => [
        'latitude' => [
            'min' => 'The latitude must be between -90 and 90.',
            'max' => 'The latitude must be between -90 and 90.',
        ],
        'longitude' => [
            'min' => 'The longitude must be between -180 and 180.',
            'max' => 'The longitude must be between -180 and 180.',
        ],
        'zoom' => [
            'min' => 'The zoom must be between 0 and 22.',
            'max' => 'The zoom must be between 0 and 22.',
        ],
    ],
    'attributes' => [
        'slug' => 'region slug',
        'latitude' => 'latitude',
        'longitude' => 'longitude',
        'zoom' => 'zoom',
        'is_published' => 'published status',
        'translations' => 'translations',
        'translations.0.language_code' => 'language code',
        'translations.0.name' => 'region name',
        'translations.0.description' => 'description',
        'translations.0.image' => 'image',
        'translations.0.Total_Population' => 'total population',
        'translations.0.Area' => 'area',
        'translations.0.Number_Provinces' => 'number of provinces',
        'translations.0.Numbrer_Communes' => 'number of communes',
        'translations.0.Urbanization_Rate' => 'urbanization rate',
        'sections' => 'sections',
        'sections.*.slug' => 'section slug',
        'sections.*.order' => 'section order',
        'sections.*.translations' => 'section translations',
        'sections.*.translations.0.language_code' => 'section language code',
        'sections.*.translations.0.title' => 'section title',
        'sections.*.translations.0.content' => 'section content',
        'sections.*.translations.0.image' => 'section image',
    ],
];