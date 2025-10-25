-- Create profiles table for user information
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  avatar_url text,
  bio text,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Enable RLS on profiles
alter table public.profiles enable row level security;

-- Create policies for profiles
create policy "Profiles are viewable by everyone"
  on public.profiles for select
  using (true);

create policy "Users can update their own profile"
  on public.profiles for update
  using (auth.uid() = id);

create policy "Users can insert their own profile"
  on public.profiles for insert
  with check (auth.uid() = id);

-- Create function to handle new user signups
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, display_name)
  values (new.id, new.raw_user_meta_data->>'display_name');
  return new;
end;
$$;

-- Trigger to create profile on signup
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Create enum for user roles
create type public.app_role as enum ('admin', 'moderator', 'user');

-- Create user_roles table
create table public.user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  role app_role not null,
  unique (user_id, role)
);

-- Enable RLS on user_roles
alter table public.user_roles enable row level security;

-- Create security definer function to check roles
create or replace function public.has_role(_user_id uuid, _role app_role)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.user_roles
    where user_id = _user_id
      and role = _role
  )
$$;

-- Policies for user_roles
create policy "Anyone can view roles"
  on public.user_roles for select
  using (true);

create policy "Only admins can insert roles"
  on public.user_roles for insert
  with check (public.has_role(auth.uid(), 'admin'));

create policy "Only admins can update roles"
  on public.user_roles for update
  using (public.has_role(auth.uid(), 'admin'));

create policy "Only admins can delete roles"
  on public.user_roles for delete
  using (public.has_role(auth.uid(), 'admin'));

-- Create storage buckets for uploads
insert into storage.buckets (id, name, public)
values 
  ('photos', 'photos', true),
  ('videos', 'videos', true)
on conflict (id) do nothing;

-- Storage policies for photos
create policy "Anyone can view photos"
  on storage.objects for select
  using (bucket_id = 'photos');

create policy "Authenticated users can upload photos"
  on storage.objects for insert
  with check (bucket_id = 'photos' and auth.role() = 'authenticated');

create policy "Users can update their own photos"
  on storage.objects for update
  using (bucket_id = 'photos' and auth.uid()::text = (storage.foldername(name))[1]);

create policy "Users can delete their own photos"
  on storage.objects for delete
  using (bucket_id = 'photos' and auth.uid()::text = (storage.foldername(name))[1]);

-- Storage policies for videos
create policy "Anyone can view videos"
  on storage.objects for select
  using (bucket_id = 'videos');

create policy "Authenticated users can upload videos"
  on storage.objects for insert
  with check (bucket_id = 'videos' and auth.role() = 'authenticated');

create policy "Users can update their own videos"
  on storage.objects for update
  using (bucket_id = 'videos' and auth.uid()::text = (storage.foldername(name))[1]);

create policy "Users can delete their own videos"
  on storage.objects for delete
  using (bucket_id = 'videos' and auth.uid()::text = (storage.foldername(name))[1]);