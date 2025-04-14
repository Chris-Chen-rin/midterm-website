-- Create messages table
create table if not exists public.messages (
    id uuid default gen_random_uuid() primary key,
    content text not null,
    user_id uuid references auth.users(id) on delete cascade not null,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table public.messages enable row level security;

-- Create policies
create policy "Users can read all messages"
    on public.messages for select
    using (true);

create policy "Authenticated users can insert their own messages"
    on public.messages for insert
    with check (auth.uid() = user_id);

create policy "Users can delete their own messages"
    on public.messages for delete
    using (auth.uid() = user_id);

-- Create profiles table if not exists
create table if not exists public.profiles (
    id uuid references auth.users(id) on delete cascade primary key,
    email text not null,
    avatar_url text,
    updated_at timestamp with time zone
);

-- Enable RLS for profiles
alter table public.profiles enable row level security;

-- Create policies for profiles
create policy "Public profiles are viewable by everyone"
    on public.profiles for select
    using (true);

create policy "Users can update their own profile"
    on public.profiles for update
    using (auth.uid() = id);

-- Function to handle new user creation
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
    insert into public.profiles (id, email, avatar_url, updated_at)
    values (new.id, new.email, null, now());
    return new;
end;
$$;

-- Trigger for new user creation
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
    after insert on auth.users
    for each row execute procedure public.handle_new_user(); 