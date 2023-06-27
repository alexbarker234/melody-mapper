import sqlite3
import networkx as nx
from networkx.readwrite import gexf

con = sqlite3.connect("data.db")
cur = con.cursor()

def init_db():
    cur.execute(''' 
    CREATE TABLE IF NOT EXISTS artist_nodes (
        id INTEGER PRIMARY KEY,
        spotify_id TEXT,
        name TEXT,
        image_url TEXT,
        popularity INTEGER
    );
    ''')
    cur.execute('''
    CREATE TABLE IF NOT EXISTS edges (
        id INTEGER PRIMARY KEY,
        artist1 TEXT,
        artist2 TEXT
    );
    ''')

def clear_db():
    cur.execute('DELETE FROM artist_nodes')
    cur.execute('DELETE FROM edges')

def add_artist(id, name, image_url, popularity):
    query = f"INSERT INTO artist_nodes (spotify_id, name, image_url, popularity) VALUES ('{id}','{safe_name(name)}', '{image_url}', '{popularity}')"
    #print(query)
    cur.execute(query)

def safe_name(name):
    name = name.replace("'", "''") # double up single quotes
    return name

def add_edges(edges: list):

    query = 'INSERT INTO edges (artist1, artist2) VALUES'
    for edge in edges:
        query += f"('{edge[0]}', '{edge[1]}'),"
    query = query[:-1]

    cur.execute(query)

def commit():
    con.commit()
def close():
    con.close()

def to_gefx():

    # get nodes
    cur.execute('SELECT spotify_id, name, popularity FROM artist_nodes')
    nodes = cur.fetchall()
    # get edges
    cur.execute('SELECT artist1, artist2 FROM edges')
    edges = cur.fetchall()

    # Create a new directed graph
    graph = nx.DiGraph()

    for row in nodes:
        graph.add_node(row[0], label=row[1], size=row[2])

    for row in edges:
        node1, node2 = row[0], row[1]
        graph.add_edge(node1, node2)

    # Save the graph as a GEXF file
    gexf.write_gexf(graph, 'artist_graph.gexf')