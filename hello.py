import pandas as pd
import numpy  as np
import sys
import json
from sklearn.cluster import KMeans
from sklearn.decomposition import PCA
from sklearn.preprocessing import StandardScaler
from flask import Flask,render_template,request
import matplotlib.pyplot as plt
from yellowbrick.cluster import KElbowVisualizer
from sklearn import manifold
from sklearn.metrics import pairwise_distances
from pandas.plotting import scatter_matrix

app = Flask(__name__)


sample_done = False

@app.route('/')
def hello_world():
    clean_data()
    return render_template("index.html")


def randomSample():
    return data.sample(frac=0.25)

#Use of Kelbow visualizer
def elbowCheck():
    mat = data.values
    mat = mat.astype(float)
    model = KMeans()
    visualizer = KElbowVisualizer(model, k=(1,12))
    visualizer.fit(mat) 
    visualizer.show(outpath="static/images/kmeans.png")

def stratifiedSample():
    #From elbow check the cluster size is best when K=4
    global frame
    global sample_done
    global colors

    if not sample_done:
        nCluster = 4
        mat = data.values
        mat = mat.astype(float)
        kmeans = KMeans(n_clusters=nCluster)
        kmeans.fit(mat)
        cInfo = kmeans.labels_
        #save clusters and recreate dataframe
        cluster = [[],[],[],[]]
        for i in range(0,len(data.index)):
            cluster[cInfo[i]].append(data.loc[i]);
    
        temp = []
        colors = []

        for i in range(0,nCluster):
            tempFrame = pd.DataFrame(cluster[i]).sample(frac=0.25)
            dfSize = tempFrame.shape[0]
            for j in range(0,dfSize):
                colors.append(i)
            temp.append(tempFrame)    
        frame = pd.concat(temp)
        sample_done = True

    return frame
       

def pcaAnalysis(sample):
    
    global sq_load
    global intD

    mat = sample.values
    mat = mat.astype(float)
    mat = StandardScaler().fit_transform(mat)
    nComponents = 18
    pca = PCA(n_components=nComponents)
    pca.fit_transform(mat)
    count = 0
    cumsu = 0
    for eigV in pca.explained_variance_ratio_:
       cumsu += eigV
       if cumsu > 0.78:
           break
       
       count += 1
    intD  = count
    #get the loading matrix
    loadings = pca.components_.T * np.sqrt(pca.explained_variance_)
    sq_loadings = np.square(loadings)
    sq_load = np.sum(sq_loadings[:,0:3],axis=1)
    topPcaLoad()   
    return pca.explained_variance_ratio_

#get topPca loadings
def topPcaLoad():

    global list_top
    list_top = []
    list_load = list(zip(data.columns,sq_load))
    list_load.sort(key=lambda x:x[1],reverse=True)
    topThree  = list_load[0:3]
    for tup in topThree:
        list_top.append(tup[0])
    print(list_top)

#helper post functions
@app.route('/getPcaData', methods=["GET","POST"])
def getPcaData():
    
    if request.method == "POST":
        columns = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16,17,18]
        pcaV = list(zip(columns, pcaAnalysis(data)));
        return json.dumps({'graph_data': pcaV}) 

@app.route('/getPcaRandom', methods=["GET","POST"])
def getPcaRandom():
    if request.method == "POST":
        columns = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16,17,18]
        pcaV = list(zip(columns, pcaAnalysis(randomSample())));
        return json.dumps({'graph_data': pcaV})


@app.route('/getPcaStratified', methods=["GET","POST"])
def getPcaStratified():
    if request.method == "POST":
        columns = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16,17,18]
        pcaV = list(zip(columns, pcaAnalysis(stratifiedSample())));
        return json.dumps({'graph_data': pcaV})

#pca scatter using two components
def pcaScatter(sample):
   
    mat = sample.values
    mat = mat.astype(float)
    mat = StandardScaler().fit_transform(mat)
    nComponents = 2
    pca = PCA(n_components=nComponents)
    new_pca = pca.fit_transform(mat)
    return new_pca

@app.route('/getScatterData', methods=["GET","POST"])
def getScatterData():

    if request.method == "POST":
       scatter_data = pcaScatter(data)
       pcaS = scatter_data.tolist()
       return json.dumps({'graph_data':pcaS})

@app.route('/getScatterRandom', methods=["GET","POST"])
def getScatterRandom():

    if request.method == "POST":
       scatter_data = pcaScatter(randomSample())
       pcaS = scatter_data.tolist()
       return json.dumps({'graph_data':pcaS})


@app.route('/getScatterStratified', methods=["GET","POST"])
def getScatterStratified():

    if request.method == "POST":
       scatter_data = pcaScatter(stratifiedSample())
       pcaS = scatter_data.tolist()
       return json.dumps({'graph_data':pcaS, 'colors':colors})

#mds Eucledian
def mdsEScatter(sample):

    mat = sample.values
    mat = mat.astype(float)
    mat = StandardScaler().fit_transform(mat)
    mds = manifold.MDS(n_components=2, dissimilarity='precomputed')
    similarity = pairwise_distances(mat, metric='euclidean')
    X = mds.fit_transform(similarity)
    return X


@app.route('/getmdsEScatterData', methods=["GET","POST"])
def getmdsEScatterData():

    if request.method == "POST":
       scatter_data = mdsEScatter(data)
       mdS = scatter_data.tolist()
       return json.dumps({'graph_data':mdS})

@app.route('/getmdsEScatterRandom', methods=["GET","POST"])
def getmdsEScatterRandom():

    if request.method == "POST":
       scatter_data = mdsEScatter(randomSample())
       mdS = scatter_data.tolist()
       return json.dumps({'graph_data':mdS})


@app.route('/getmdsEScatterStratified', methods=["GET","POST"])
def getmdsEScatterStratified():

    if request.method == "POST":
       scatter_data = mdsEScatter(stratifiedSample())
       mdS = scatter_data.tolist()
       return json.dumps({'graph_data':mdS, 'colors':colors})

#mds correlation
def mdsCScatter(sample):

    mat = sample.values
    mat = mat.astype(float)
    mat = StandardScaler().fit_transform(mat)
    mds = manifold.MDS(n_components=2, dissimilarity='precomputed')
    similarity = pairwise_distances(mat, metric='correlation')
    X = mds.fit_transform(similarity)
    return X


@app.route('/getmdsCScatterData', methods=["GET","POST"])
def getmdsCScatterData():

    if request.method == "POST":
       scatter_data = mdsCScatter(data)
       mdS = scatter_data.tolist()
       return json.dumps({'graph_data':mdS})

@app.route('/getmdsCScatterRandom', methods=["GET","POST"])
def getmdsCScatterRandom():

    if request.method == "POST":
       scatter_data = mdsCScatter(randomSample())
       mdS = scatter_data.tolist()
       return json.dumps({'graph_data':mdS})


@app.route('/getmdsCScatterStratified', methods=["GET","POST"])
def getmdsCScatterStratified():

    if request.method == "POST":
       scatter_data = mdsCScatter(stratifiedSample())
       mdS = scatter_data.tolist()
       return json.dumps({'graph_data':mdS, 'colors':colors})


#top pca load scatter matrix
def scatterMatrix(sample):
    mat = sample.values
    mat = mat.astype(float)
    mat = StandardScaler().fit_transform(mat)
    new_frame = pd.DataFrame(mat,columns=data.columns)
    final_frame = new_frame[['Value', 'Acceleration', 'Release Clause']]
    return final_frame


@app.route('/scatterMatrixData', methods=["GET","POST"])
def scatterMatrixData():
    if request.method == "POST":
        df_csv = scatterMatrix(data)
        cluster_index = [4]*df_csv.shape[0];
        df_csv['Cluster'] = pd.Series(cluster_index);
        df_csv.to_csv("static/data/out3.csv",index=False)
        return "out3.csv"


@app.route('/scatterMatrixRandom', methods=["GET","POST"])
def scatterMatrixRandom():
    if request.method == "POST":
        df_csv = scatterMatrix(randomSample())
        cluster_index = [4]*df_csv.shape[0];
        df_csv['Cluster'] = pd.Series(cluster_index);
        df_csv.to_csv("static/data/out4.csv",index=False)
        return "out4.csv"

@app.route('/scatterMatrixStratified', methods=["GET","POST"])
def scatterMatrixStratified():
    if request.method == "POST":
        df_csv = scatterMatrix(stratifiedSample())
        df_csv['Cluster'] = pd.Series(colors);
        df_csv.to_csv("static/data/out5.csv",index=False)
        return "out5.csv"



def toFloat(d):
    try:
       x = float(d)
       return x
    except ValueError:
       return 0


def clean_values(d):
        divider = 1.0;
        d = str(d)


        if d == "nan":
            return 0
         
        if "K" in d:
            divider = 1000.0

        d = d.replace("K","").replace("M","").replace("\u20ac","")
        return toFloat(d)/divider


def looper(d):
    
    if d == "left" or d == "right":
        return d
    return "NA"


def clean_data():
    
    global data
    data = pd.read_csv("static/data/clean.csv")
    
    #Dropped
    data.drop('ID',axis=1,inplace=True)
    data.drop('Work Rate',axis=1,inplace=True)
    data.drop('Height',axis=1,inplace=True)
    data.drop('Club',axis=1,inplace=True)
    
    data.Weight = data.Weight.str.replace("lbs","")
    data.Value  = data["Value"].apply(clean_values)
    data.Wage   = data["Wage"].apply(clean_values)
    data["Release Clause"] = data["Release Clause"].apply(clean_values)
    
    #Foot
    data["Preferred Foot"] = data["Preferred Foot"].str.lower().apply(looper)
    data["Preferred Foot"] = pd.Categorical(data["Preferred Foot"])
    data["Preferred Foot"] = data["Preferred Foot"].cat.codes

    #Countries
    data["Nationality"] = data["Nationality"].str.lower()
    data["Nationality"] = pd.Categorical(data["Nationality"])
    data["Nationality"] = data["Nationality"].cat.codes
   
    #Body Type
    data["Body Type"] = data["Body Type"].str.lower()
    data["Body Type"] = pd.Categorical(data["Body Type"])
    data["Body Type"] = data["Body Type"].cat.codes

    #position
    data["Position"] = data["Position"].str.lower()
    data["Position"] = pd.Categorical(data["Position"])
    data["Position"] = data["Position"].cat.codes

    
