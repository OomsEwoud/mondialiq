<?php

namespace App\Filament\Resources\Teams\RelationManagers;

use App\Filament\Resources\Teams\TeamResource;
use Filament\Actions\BulkActionGroup;
use Filament\Actions\CreateAction;
use Filament\Actions\DeleteAction;
use Filament\Actions\DeleteBulkAction;
use Filament\Actions\EditAction;
use Filament\Forms\Components\DatePicker;
use Filament\Forms\Components\Select;
use Filament\Forms\Components\TextInput;
use Filament\Resources\RelationManagers\RelationManager;
use Filament\Schemas\Schema;
use Filament\Tables\Columns\ImageColumn;
use Filament\Tables\Columns\TextColumn;
use Filament\Tables\Table;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Auth;

class CoachRelationManager extends RelationManager
{
    protected static string $relationship = 'coach';

    public static function canViewForRecord(Model $ownerRecord, string $pageClass): bool
    {
        return TeamResource::userCanManageTeams();
    }

    protected function canCreate(): bool
    {
        return TeamResource::userIsSuperAdmin() && ! $this->getOwnerRecord()->coach()->exists();
    }

    protected function canEdit(Model $record): bool
    {
        return TeamResource::userCanManageTeams();
    }

    protected function canDelete(Model $record): bool
    {
        return TeamResource::userIsSuperAdmin();
    }

    protected function canDeleteAny(): bool
    {
        return TeamResource::userIsSuperAdmin();
    }

    public function form(Schema $schema): Schema
    {
        return $schema
            ->columns(2)
            ->components([
                TextInput::make('display_name')
                    ->label('Display name')
                    ->required()
                    ->maxLength(255),

                Select::make('country_id')
                    ->label('Country')
                    ->relationship('country', 'name')
                    ->searchable()
                    ->preload()
                    ->disabled(fn (): bool => ! TeamResource::userIsSuperAdmin()),

                TextInput::make('first_name')
                    ->label('First name')
                    ->maxLength(255),

                TextInput::make('last_name')
                    ->label('Last name')
                    ->maxLength(255),

                DatePicker::make('birth_date')
                    ->label('Birth date'),

                TextInput::make('photo_url')
                    ->label('Photo URL')
                    ->url()
                    ->maxLength(2048)
                    ->placeholder('https://example.com/coach.jpg')
                    ->helperText('Use this field to correct a missing or incorrect coach photo.')
                    ->columnSpanFull(),
            ]);
    }

    public function table(Table $table): Table
    {
        return $table
            ->columns([
                ImageColumn::make('photo_url')
                    ->label('Photo')
                    ->circular()
                    ->imageHeight(32),

                TextColumn::make('display_name')
                    ->label('Coach')
                    ->searchable()
                    ->sortable(),

                TextColumn::make('country.name')
                    ->label('Country')
                    ->searchable()
                    ->limit(20),

                TextColumn::make('birth_date')
                    ->label('Birth date')
                    ->date('d M Y')
                    ->sortable(),
            ])
            ->headerActions([
                CreateAction::make()
                    ->visible(fn (): bool => TeamResource::userIsSuperAdmin() && ! $this->getOwnerRecord()->coach()->exists()),
            ])
            ->recordActions([
                EditAction::make()
                    ->visible(fn () => Auth::user()?->hasAnyRole(['admin', 'super_admin']))
                    ->using(function (Model $record, array $data): Model {
                        if (! TeamResource::userIsSuperAdmin()) {
                            unset($data['country_id'], $data['external_id'], $data['team_id']);
                        }

                        $record->update($data);

                        return $record;
                    }),

                DeleteAction::make()
                    ->visible(fn (): bool => TeamResource::userIsSuperAdmin()),
            ])
            ->toolbarActions([
                BulkActionGroup::make([
                    DeleteBulkAction::make()
                        ->visible(fn (): bool => TeamResource::userIsSuperAdmin()),
                ]),
            ]);
    }
}
