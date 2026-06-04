<?php

namespace App\Filament\Resources\Users\Schemas;

use Filament\Forms\Components\TextInput;
use Filament\Schemas\Schema;
use Filament\Forms\Components\Select;
use Illuminate\Support\Facades\Auth;

class UserForm
{
    public static function configure(Schema $schema): Schema
    {
        return $schema
            ->columns(1)
            ->components([
                TextInput::make('name')
                    ->required()
                    ->maxLength(255)
                    ->helperText('Use this field to replace an inappropriate display name.'),

                TextInput::make('avatar')
                    ->label('Avatar URL')
                    ->url()
                    ->maxLength(2048)
                    ->placeholder('https://example.com/avatar.png')
                    ->helperText('Use this field to replace an inappropriate profile image.'),

                Select::make('roles')
                    ->relationship('roles', 'name')
                    ->multiple()
                    ->preload()
                    ->visible(fn() => Auth::user()?->hasRole('super_admin')),
            ]);
    }
}
