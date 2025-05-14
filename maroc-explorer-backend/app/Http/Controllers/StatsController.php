<?php

  namespace App\Http\Controllers;

  use Illuminate\Http\Request;
  use App\Models\Region;
  use App\Models\Province;
  use App\Models\Contact;
  use App\Models\Commune;
  use App\Models\User;
  use Illuminate\Support\Facades\DB;
  use App\Models\Visit;
  use Carbon\Carbon;

  class StatsController extends Controller
  {
      public function stats()
      {
          return response()->json([
              'totalRegions' => Region::count(),
              'totalProvinces' => Province::count(),
              'totalCommunes' => Commune::count(),
              'totalContacts' => Contact::count(),
          ], 200);
      }

      public function recentActivity()
      {
          $activities = Contact::orderBy('created_at', 'desc')->take(5)->get()->map(function ($contact) {
              return [
                  'message' => "New contact submission by {$contact->name}",
                  'created_at' => $contact->created_at,
              ];
          });

          return response()->json($activities, 200);
      }
      public function trackVisit(Request $request){
         $today = Carbon::today()->toDateString();
         Visit::updateOrCreate(
            ['visit_date' => $today],
            ['count' =>DB::raw('count + 1')]
      );
     return response()->json(['message' => 'Visit tracked'], 200);
     }
     public function visits(){
          $visits = Visit::orderBy('visit_date', 'asc')
            ->take(30) 
            ->get()
            ->map(function ($visit){
                return [
                'date' => $visit->visit_date,
                'count' => $visit->count,
              ];
        });
       return response()->json($visits, 200);
     }
     public function recentUsers(){
    $users = User::orderBy('created_at', 'desc')
        ->take(5)
        ->get()
        ->map(function ($user) {
            return [
                'name' => $user->name,
                'email' => $user->email,
                'created_at' => $user->created_at->toDateTimeString(),
            ];
        });
    return response()->json($users, 200);
}
  }