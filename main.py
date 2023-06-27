import os
import spotipy
from spotipy.oauth2 import SpotifyOAuth
from dotenv import load_dotenv

from db import add_artist, add_edges, clear_db, close, commit, init_db, to_gefx
load_dotenv()

# Spotify credentials
client_id = os.environ.get("CLIENT_ID")
client_secret = os.environ.get("CLIENT_SECRET")
redirect_uri =  "http://localhost:8888/callback"
scope = ''

sp = spotipy.Spotify(auth_manager=SpotifyOAuth(client_id=client_id,
                                               client_secret=client_secret,
                                               redirect_uri=redirect_uri,
                                               scope=scope))

init_db()
clear_db()

seed_artist_id = '2RVvqRBon9NgaGXKfywDSs'
queue = []
already_queued = set()

# START FROM WHERE WE LEFT OFF
queue_file_name = 'queue.txt'
processed_file_name = 'processed.txt'
delimiter = '|.8|2e|' # just a random string as temp solution
if os.path.exists(queue_file_name):
    with open(queue_file_name, 'r') as file:
        contents = file.read()
        queue = contents.split(delimiter) 
if os.path.exists(processed_file_name):
    with open(processed_file_name, 'r') as file:
        contents = file.read()
        queue = contents.split(delimiter) 

queue_file = open(queue_file_name, 'w')
processed_file = open(processed_file_name, 'w')

def save_progress():
    queue_file.write(delimiter.join(queue))
    processed_file.write(delimiter.join(already_queued))

def get_related_artists(artist_id):
    results = sp.artist_related_artists(artist_id)
    related_artists = results['artists']
    return related_artists

def add_artists_to_queue(artists):
    for artist in artists:
        if artist['id'] not in already_queued:
            add_artist(artist['id'], artist['name'], artist['images'][0]['url'], artist['popularity'])
            queue.append(artist['id'])
            already_queued.add(artist['id'])

def get_popularity(artist):
    return artist['popularity']

limit = 5

def process_artist_queue():
    cur = 0
    while queue and cur < limit:
        save_progress()
        #print(f"{[x['name'] for x in queue]}")
        cur += 1
        #queue.sort(key=get_popularity, reverse=True)
        cur_artist_id = queue.pop(0)

        #print(f"Processing artist: {cur_artist_id['name']} (Popularity: {cur_artist_id['popularity']})")

        related_artists = get_related_artists(cur_artist_id)
        # for related_artist in related_artists:
        #     print(f"{related_artist['name']} ", end="")

        add_artists_to_queue(related_artists)

        edges = []
        for related_artist in related_artists:
            edges.append([cur_artist_id, related_artist['id']])

        add_edges(edges)

        print(f"Queue length is now {len(queue)}")
        print(f"{cur}/{limit}")
    commit()
    to_gefx()
        # Do whatever you want with the artist here
    print(f"Finished processing: {len(already_queued)} artists:")
    close()
    # for artist in processed_artists:
    #     print(f"\t{artist}")

seed_artist_info = sp.artist(seed_artist_id)
add_artists_to_queue([seed_artist_info])

# Process the artist queue
process_artist_queue()
