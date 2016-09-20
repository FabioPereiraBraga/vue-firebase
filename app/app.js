requirejs(['firebase-config'] , function (config) {


    var firebaseApp = firebase.initializeApp(config);
    var db = firebaseApp.database();
    var chatComponent = Vue.extend({
        template:`
       <style scoped>
        .chat{
          background: #CCC;
          padding: 5px;
          border-radius: 5px;
          margin: 8px;
         }
         .chat-cont{
            margin: 5px auto 5px auto;
         }
       </style>
           <div class="panel panel-primary">
               <div class="panel-heading">
                   <h3 class="panel-title">Chat</h3>
               </div>
               <div class="panel-body" style="min-height: 400px;">
                   <ul class="list-unstyled">
                       <li  v-for="o in messages">
                           <div class="col-sm-12 chat-cont">
                           <div  :class="{ 'pull-left': !verifiEmailUser(o.email), 'pull-right': verifiEmailUser(o.email) }">
                            <img src="{{o.photo}}" class="img-circle">
                           </div>
                           <div  :class="{ 'pull-left chat': !verifiEmailUser(o.email), 'pull-right chat': verifiEmailUser(o.email) }" >
                           <p> <i> {{o.email}} </i> </p>
                               {{o.text}}
                           </div>
                           </div>
                       </li>
                   </ul>
               </div>
               <div class="panel-footer">
                   <div class="input-group">
                       <input type="text" class="form-control"  @keyup.enter="enviarMensagem"  v-model='mensagem' placeholder="Digite sua menssagem">
                       <span class="input-group-btn">
                         <button class="btn btn-success" type="button"  v-on:click="enviarMensagem">enviar</button>
                       </span>
                  </div>
               </div>
           </div>

       `,

        created:function()
        {

            var roomRef = 'chat/rooms/'+this.$route.params.rooms;
            this.$bindAsArray('messages',db.ref(roomRef + '/messages'));

        },

        data:function() {
            return {

                user: {
                    name: localStorage.getItem('name'),
                    email: localStorage.getItem('email'),
                    photo:localStorage.getItem('photo')
                },
                mensagem:''
            }
        },

        methods:{

            enviarMensagem(e){
                e.preventDefault();

                this.$firebaseRefs.messages.push({
                    text:  this.mensagem,
                    name:  this.user.name,
                    photo: this.user.photo,
                    email: this.user.email
                });

                this.mensagem = '';

            },
            verifiEmailUser( email )
            {
                if( email === this.user.email)
                {
                    return true;
                }
                return false;
            }
        }

    });



    var roomsComponet = Vue.extend({
        template:`
   <div class="col-md-4" v-for="o in rooms ">
    <div class="panel panel-primary">
     <div class="panel-heading">{{o.name}}</div>
       <div class="panel-body">
        {{o.description}}
        <p>
       <a href="#" @click="openModel( $event,o )">entrar</a> 
       </p>
       </div>
   </div> 
  </div>
  
  
   <div class="modal fade" tabindex="-1" role="dialog" id="modal-acesso">
      <div class="modal-dialog" role="document" >
          <div class="modal-content">
              <div class="modal-header">
                  <button type="button" class="close" data-dismiss="modal" aria-label="Close"><span aria-hidden="true">&times;</span></button>
                  <h4 class="modal-title">Acessar Room</h4>
              </div>
              <div class="modal-body">
                  <div class="form-group">
                      <label>Email</label>
                      <input type="text" v-model="email" name="email" placeholder="Digite o Email" class="form-control" />
                 </div>
              <div class="form-group">
                  <label>Nome</label>
                  <input type="text" v-model="name" name="name" placeholder="Digite o Nome" class="form-control" />
              </div>
         
      </div>
      <div class="modal-footer">
          <button type="button" class="btn btn-default" data-dismiss="modal">Fechar</button>
          <button type="button" class="btn btn-primary" @click="entrarChat($event)" >Logar</button>
      </div>
  </div>
  </div>
   `,

        firebase:{
            rooms:db.ref('chat/rooms')
        },
        data:function(){
            return {
                email:'',
                name:'',
                room:''
            }
        },
        methods:{
            entrarChat:function(e,room)
            {
                e.preventDefault();

                localStorage.setItem('name',this.name);
                localStorage.setItem('email',this.email);
                localStorage.setItem('photo','http://www.gravatar.com/avatar/'+md5(this.email)+'.jpg');

                $('#modal-acesso').modal('hide');
                this.$route.router.go('/chat/'+ this.room);
            },
            openModel:function ( e ,rooms)
            {
                e.preventDefault();
                this.room = rooms['.key'];
                $('#modal-acesso').modal('show');
            }
        },




    });


    var salas = [
        {id: "001", name: "PHP", description: "Entusiasta do PHP"},
        {id: "002",name: "Java", description: "Developer experts"},
        {id: "003",name: "C#", description: "Os caras do C#"},
        {id: "004",name: "C++", description: "Fissurados por programação"},
        {id: "005",name: "Javascript", description: "Olha a web aí!"},
        {id: "006",name: "Vue.js", description: "Chat dos caras do data-binding"},
    ];

    var roomsCreateComponents = Vue.extend({
        template: `
    <h3>Salas Criadas </h3>
      <ul>
       <li v-for="o in rooms"> {{ o.description }}</li> 
     </ul>
     `,
        firebase:{
            rooms:db.ref('chat/rooms')
        },

        ready:function()
        {
            var chatRef = db.ref('chat');
            var roomsChildren = chatRef.child('rooms');

            salas.forEach(function (room){
                roomsChildren.child(room.id).set({
                    name:room.name,
                    description:room.description
                });
            });
        },



    });

    var appComponent = Vue.extend({});
    var router = new VueRouter();

    router.map({
        '/chat/:rooms':{
            component: chatComponent
        },
        '/rooms':{
            component: roomsComponet
        },
        '/create-salas':{
            component:roomsCreateComponents
        }
    });

    router.start(appComponent, '#app');



});
