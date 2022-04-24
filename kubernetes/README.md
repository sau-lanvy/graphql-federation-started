# Kubernetes Setup

## Prerequisite
- Docker
- Kubectl - https://kubernetes.io/docs/tasks/tools/install-kubectl-windows/
- Minikube - https://minikube.sigs.k8s.io/docs/start/

## Start the Minikube cluster
- Start the cluster Use 1.13.x or newer version of Kubernetes with --kubernetes-version
  `minikube start --cpus=4 --memory=4096 --kubernetes-version=1.16.2`
  or run the following command:
  `minikube start`
  
- Open the Kubernetes dashboard in a browser
  `minikube dashboard`

- Open Dashboard with URL
  If you don't want to open a web browser, run the dashboard command with the --url flag to emit a URL:
  `minikube dashboard --url`

## Verify Minikube cluster
### Create a new namespace
- Using the command `kubectl create` to create `graph-development` namespace:
  `kubectl create namespace graph-development`
- Define a context for the kubectl client to work in `graph-development` namespace:

   `kubectl config set-context graph-dev --namespace=graph-development --cluster=minikube --user=minikube`
- Switch to operate in the development namespace.
  `kubectl config use-context graph-dev`
### Create a deployment
- Use the `kubectl create` command to create a Deployment that manages a Pod. The Pod runs a Container based on the provided Docker image.
  `kubectl create deployment hello-node --image=k8s.gcr.io/echoserver:1.4`
- View the Deployment:
  `kubectl get deployments`

### Create a Service 
- Expose the Pod to the public internet using the `kubectl expose` command:
  `kubectl expose deployment hello-node --type=LoadBalancer --port=8080`

- View the Service you created:
  `kubectl get services`

- Tunnel the service and view on the browser
  `minikube service hello-node --url`

## Set up a registry server
### Setup local registry
- You can follow the guide from the docker for creating a [local registry](https://docs.docker.com/registry/deploying/):
  `docker run -d -p 5000:5000 --restart=always --name registry registry:2`
### Setup in local machine
- Edit /etc/hosts to add this line:
  127.0.0.1   registry.local
- Now tag your image properly:
  docker tag my-image registry.local:5000/my-image:0.0.1
- Push your image to local registry:
  docker push registry.local:5000/my-image:0.0.1
- Verify that image is pushed:
  curl -X GET http://registry.local:5000/v2/my-image/tags/list
- Get your host machine's ip
  ipconfig getifaddr en0 -> 192.168.x.x
### Setup in minikube
You can follow the guide from minikue website to enable insecure registry support within minikube at: https://minikube.sigs.k8s.io/docs/tasks/registry/insecure/
else follow below steps each time you start new minikube cluster:
- ssh into minikube with: 
  minikube ssh
- edit /etc/hosts to add this line
  192.168.x.x   registry.local
- Try to pull the image:
  docker pull registry.local:5000/my-image:0.0.1
  
  You might get an http access error. -> Error response from daemon: Get https://registry.local:5000/v2/: http: server gave HTTP response to HTTPS client
- For the TLS issue you need to Stop the docker service inside minikube
  systemctl stop docker (maybe you need: sudo)
- Get the path of the docker serice file
  systemctl status docker
  -> /usr/lib/systemd/system/docker.service
- Edit the docker serice file by append this this:
  --insecure-registry registry.local:5000 
  to this line:
  ExecStart= ....  --insecure-registry 10.96.0.0/12 
- Then reload daemon and start the docker service
  systemctl daemon-reload
  systemctl start docker
- After that try to pull again
  docker pull registry.local:5000/my-image:0.0.1
  -> The command shoul work with the status: Downloaded newer image for registry.local:5000/my-image:0.0.1



  
  