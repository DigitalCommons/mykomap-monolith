# In case of server problems

## Hetzner Cloud

First port of call is probably Hetzner. The login should be in our password store service. Then you need to navigate to Hetzner's Cloud services (Their Robot site is for bare metal.)

Check the graphs to see if the server is under heavy load CPU/IO/Network, has stopped, or is otherwise having problems. There is a dropdown which can switch the view from "Live" to an overview of the last hour, day, month, etc.

- List of DCC servers: https://console.hetzner.cloud/projects/1450952/servers
  - Prod-2 graphs: https://console.hetzner.cloud/projects/1450952/servers/39640291/graphs
  - Dev-2 graphs: https://console.hetzner.cloud/projects/1450952/servers/36089475/graphs

If it's a load issue, there's a "Rescale" tab with which we can upgrade the server to more CPU, Memory and disk space. This should be quick, but it will require a reboot.

If it's something which has run amok on the server, it *may* be resolved by a reboot. Use the reset button on the "Power" tab. However, not if the disks are full, and this can't be determined from the Hetzner console directly.

Some clues might be available from the server console, which you can open using the link in the "Actions" dropdown for the server on the graph page above. This is like taking a peep at the physical monitor of the server, if it had one. If things are looking normal you'll just see a log-in prompt. But you might find some system log messages there which give you a clue.


## Root console things

At the time of writing, there is no password access to the root (or in fact any) user accounts on the server, so you can't actually log in via the server console. But you can reset the root password on the "Rescue" tab of the Hetzner console, although this will probably trigger a reboot.  However, then you can use that to log into the server console.

Alternatively someone with access can add your SSH public key, if you have one, to `/root/.ssh/authorized_keys`, and then you should be able to ssh in via `root@prod-2.digitalcommons.coop` (insert correct hostname as appropriate)

However, when the server is in real trouble, perhaps because it can't cope with the load, typically logging into the console is fraught with problems. In which case using the Hetzner console is better.

### What's the CPU / Memory load?

On the console this can be done by running the command `top`, which will show an updating table of processes like this:

```
Tasks: 145 total,   1 running, 144 sleeping,   0 stopped,   0 zombie
%Cpu(s):  2.9 us,  5.9 sy,  0.0 ni, 91.2 id,  0.0 wa,  0.0 hi,  0.0 si,  0.0 st
MiB Mem :   7747.9 total,   5298.0 free,    954.0 used,   1496.0 buff/cache
MiB Swap:      0.0 total,      0.0 free,      0.0 used.   6476.3 avail Mem 

    PID USER      PR  NI    VIRT    RES    SHR S  %CPU  %MEM     TIME+ COMMAND                                                                                                                                                             
   4431 root      20   0   16916  10220   8372 S  11.8   0.1   0:00.04 sshd                                                                                                                                                                
    395 root      19  -1  340468 115548 114352 S   5.9   1.5   0:11.21 systemd-journal                                                                                                                                                     
      1 root      20   0  100908  11816   8416 S   0.0   0.1   0:03.54 systemd                                                                                                                                                             
      2 root      20   0       0      0      0 S   0.0   0.0   0:00.00 kthreadd                                                                                                                                                            
      3 root       0 -20       0      0      0 I   0.0   0.0   0:00.00 rcu_gp                                                                                                                                                              
      4 root       0 -20       0      0      0 I   0.0   0.0   0:00.00 rcu_par_gp                                                                                                                                                          
      5 root       0 -20       0      0      0 I   0.0   0.0   0:00.00 slub_flushwq                                                                                                                                                        
      6 root       0 -20       0      0      0 I   0.0   0.0   0:00.00 netns                                                                                                                                                               
      8 root       0 -20       0      0      0 I   0.0   0.0   0:00.00 kworker/0:0H-events_highpri                                                                                                                                         
     10 root       0 -20       0      0      0 I   0.0   0.0   0:00.00 mm_percpu_wq                                                                                                                                                        
     11 root      20   0       0      0      0 S   0.0   0.0   0:00.00 rcu_tasks_rude_                                                                                                                                                     
     12 root      20   0       0      0      0 S   0.0   0.0   0:00.00 rcu_tasks_trace                                                                                                                                                     
     13 root      20   0       0      0      0 S   0.0   0.0   0:00.11 ksoftirqd/0                                                                                                                                                         
     14 root      20   0       0      0      0 I   0.0   0.0   0:00.37 rcu_sched                                                                                                                                                           
     15 root      rt   0       0      0      0 S   0.0   0.0   0:00.02 migration/0       
```

The processes are sorted by load. You can switch it to sort by memory use by pressing the `m` key. The `?` key will show brief overview of the keys you can press. 

To exit, use `q`.


### Disk full?

You can check the disk's capacity and free space with `df -h`. At the time of writing, the output looks like this:

```
root@dev-2:~# df -h
Filesystem      Size  Used Avail Use% Mounted on
tmpfs           775M  936K  774M   1% /run
/dev/sda1        75G   53G   20G  74% /
tmpfs           3.8G     0  3.8G   0% /dev/shm
tmpfs           5.0M     0  5.0M   0% /run/lock
/dev/sda15      253M  6.1M  246M   3% /boot/efi
tmpfs           775M     0  775M   0% /run/user/0
tmpfs           775M     0  775M   0% /run/user/7001
tmpfs           775M     0  775M   0% /run/user/7003
tmpfs           775M     0  775M   0% /run/user/7002
```

This tells us that the main disk `/` is 75% full, with 20G available.  The other partitions can mostly be ignored. 

If it's near 100% then the server is in trouble. Fixing that requires either increasing the disk size or finding some garbage or otherwise deletable files to remove.  If your technical skill is low, using the "Rescale" option mentioned in the section above is probably the safest option.  However, typical places to look are in `/var/` - safe things to delete will be in directories named `tmp` `temp` `cache` or similar. Avoid deleting logs unless you really have to, but that's another thing which can fill up.  E.g.

```
root@dev-2:~# du -sh /var/*
2.6M    /var/backups
121M    /var/cache
4.0K    /var/crash
40G     /var/lib
4.0K    /var/local
0       /var/lock
4.5G    /var/log
4.0K    /var/mail
4.0K    /var/opt
0       /var/run
28K     /var/spool
14M     /var/tmp
112M    /var/www
root@dev-2:~# du -sh /var/tmp.*
du: cannot access '/var/tmp.*': No such file or directory
root@dev-2:~# du -sh /var/tmp/*
4.0K    /var/tmp/cloud-init
8.0K    /var/tmp/systemd-private-5d313365530846358c648b6ed26b16fd-apache2.service-k3rsZh
8.0K    /var/tmp/systemd-private-5d313365530846358c648b6ed26b16fd-systemd-logind.service-nMa2no
8.0K    /var/tmp/systemd-private-5d313365530846358c648b6ed26b16fd-systemd-resolved.service-bGGS1b
8.0K    /var/tmp/systemd-private-5d313365530846358c648b6ed26b16fd-systemd-timesyncd.service-jAqmK6
14M     /var/tmp/virtuoso
root@dev-2:~# du -sh /var/log/*
4.0K    /var/log/alternatives.log
12K     /var/log/alternatives.log.1
4.0K    /var/log/alternatives.log.10.gz
4.0K    /var/log/alternatives.log.11.gz
4.0K    /var/log/alternatives.log.12.gz
4.0K    /var/log/alternatives.log.2.gz
4.0K    /var/log/alternatives.log.3.gz
[...elided]
```

If you're really hunting for the culprit, you can get a sorted list of directories and files by size using:

```
root@dev-2:~# du -cax / | sort -rn | tee filesizes.txt | head
55008892        total
55008892        /
46799932        /var
41895664        /var/lib
33852844        /var/lib/mysql
32256420        /var/lib/mysql/property_boundaries
18362384        /var/lib/mysql/property_boundaries/land_ownership_polygons.ibd
11341836        /var/lib/mysql/property_boundaries/pending_inspire_polygons.ibd
7584452         /var/lib/backups
7584448         /var/lib/backups/property_boundaries.borg
```

This also writes the list to `filesizes.txt` which you can inspect with `less filesizes.txt` (press the 'h' key after running it for help, or run `man less` for the manual page)

## Rebooting from the root console

You can do that like this:

```
root@dev-2:~# reboot
```

There's also a `halt` command, but the server will stay off if you use that.

## Monitoring and restarting the mykomap server

### As the application user...

Usually devs do this when logged in as the user running the application - in this case, on dev-2 and prod-2, this will be `broccoli`.


This shows (a simple case of) how the server is rebuilt. For more and more accurate details, see the [mykomap-monolith deployment documentation](https://digitalcommons.github.io/mykomap-monolith/deployment/).
```
root@dev-2:~# su - broccoli               # switch from root to the broccoli user

broccoli@dev-2:~$ cd ~/deploy/data/       # switch to the data directory

broccoli@dev-2:~/deploy/data$ git pull    # pull the latest data (simple case, assumes no branch switching needed)
Already up to date.

broccoli@dev-2:~/deploy/data$ cd ~/gitworking/mykomap-monolith/            # switch to the app directory

broccoli@dev-2:~/gitworking/mykomap-monolith$ git pull
Already up to date.

broccoli@dev-2:~/gitworking/mykomap-monolith$ . ~/gitworking/deploy.env   # load the environment variables needed to rebuild the app and restart the service

broccoli@dev-2:~/gitworking/mykomap-monolith$ systemctl status --user mykomap-backend.service  # Check the app service status
● mykomap-backend.service - Mykomap back-end process manager for broccoli
     Loaded: loaded (/home/broccoli/.config/systemd/user/mykomap-backend.service; enabled; vendor preset: enabled)
     Active: active (running) since Sun 2024-11-24 17:48:10 UTC; 6min ago
       Docs: https://github.com/DigitalCommons/mykomap-monolith/
   Main PID: 4056 (npm run start:a)
      Tasks: 35 (limit: 9242)
     Memory: 151.5M
        CPU: 12.869s
     CGroup: /user.slice/user-7002.slice/user@7002.service/app.slice/mykomap-backend.service
             ├─4056 "npm run start:attached" "" "" "" "" "" "" "" "" "" "" "" "" "" "" "" "" "" "" "" "" "" "" "" "" "" "" "" "" "" "" "" "" "" "" "" "" "" "" "" "" "" "" "" "" "" "" "" "" "" "" "" "" ""
             ├─4203 sh -c "npm run start"
             ├─4204 "npm run start" "" "" "" "" "" "" "" "" "" "" "" "" "" "" "" "" "" "" "" "" "" "" "" "" "" "" "" "" "" "" "" "" "" "" "" "" "" "" "" "" "" "" "" "" "" "" "" "" "" "" "" "" ""
             ├─4242 sh -c "node ./start.js"
             └─4243 node ./start.js

Nov 24 17:54:34 dev-2.digitalcommons.coop bash[4243]: {"level":30,"time":1732470874892,"pid":4243,"hostname":"dev-2.digitalcommons.coop","reqId":"req-1d","req":{"method":"GET","url":"/dataset/delhi/search?filter%5B0%5D=data_sources%3A>
Nov 24 17:54:34 dev-2.digitalcommons.coop bash[4243]: {"level":30,"time":1732470874910,"pid":4243,"hostname":"dev-2.digitalcommons.coop","reqId":"req-1d","res":{"statusCode":200},"responseTime":17.900402000173926,"msg":"request comple>
Nov 24 17:54:40 dev-2.digitalcommons.coop bash[4243]: {"level":30,"time":1732470880871,"pid":4243,"hostname":"dev-2.digitalcommons.coop","reqId":"req-1e","req":{"method":"GET","url":"/dataset/delhi/search?filter%5B0%5D=data_sources%3A>
Nov 24 17:54:40 dev-2.digitalcommons.coop bash[4243]: {"level":30,"time":1732470880902,"pid":4243,"hostname":"dev-2.digitalcommons.coop","reqId":"req-1e","res":{"statusCode":200},"responseTime":30.778594000265002,"msg":"request comple>
Nov 24 17:54:41 dev-2.digitalcommons.coop bash[4243]: {"level":30,"time":1732470881048,"pid":4243,"hostname":"dev-2.digitalcommons.coop","reqId":"req-1f","req":{"method":"GET","url":"/dataset/delhi/search?filter%5B0%5D=data_sources%3A>
Nov 24 17:54:41 dev-2.digitalcommons.coop bash[4243]: {"level":30,"time":1732470881067,"pid":4243,"hostname":"dev-2.digitalcommons.coop","reqId":"req-1f","res":{"statusCode":200},"responseTime":19.006068999879062,"msg":"request comple>
Nov 24 17:54:41 dev-2.digitalcommons.coop bash[4243]: {"level":30,"time":1732470881068,"pid":4243,"hostname":"dev-2.digitalcommons.coop","reqId":"req-1g","req":{"method":"GET","url":"/dataset/delhi/search?filter%5B0%5D=data_sources%3A>
Nov 24 17:54:41 dev-2.digitalcommons.coop bash[4243]: {"level":30,"time":1732470881107,"pid":4243,"hostname":"dev-2.digitalcommons.coop","reqId":"req-1g","res":{"statusCode":200},"responseTime":38.5415049996227,"msg":"request complete>
Nov 24 17:54:41 dev-2.digitalcommons.coop bash[4243]: {"level":30,"time":1732470881209,"pid":4243,"hostname":"dev-2.digitalcommons.coop","reqId":"req-1h","req":{"method":"GET","url":"/dataset/delhi/search?filter%5B0%5D=data_sources%3A>
Nov 24 17:54:41 dev-2.digitalcommons.coop bash[4243]: {"level":30,"time":1732470881238,"pid":4243,"hostname":"dev-2.digitalcommons.coop","reqId":"req-1h","res":{"statusCode":200},"responseTime":28.585051000118256,"msg":"request comple>

broccoli@dev-2:~/gitworking/mykomap-monolith$ ./deploy.sh # start the rebuild. should restart the server automatically

[... detailed output elided]

```

### As the root user...

But this can also be done as the root user, perhaps with more ease, because of one less step. In this example, the server status is checked, then it is restarted, then started (which should do nothing if it already started) then the status is checked again. You can see the process number and memory usage change.

```
root@dev-2:~# systemctl --machine broccoli@.host --user  status mykomap-backend
● mykomap-backend.service - Mykomap back-end process manager for broccoli
     Loaded: loaded (/home/broccoli/.config/systemd/user/mykomap-backend.service; enabled; vendor preset: enabled)
     Active: active (running) since Sun 2024-11-24 17:14:53 UTC; 33min ago
       Docs: https://github.com/DigitalCommons/mykomap-monolith/
   Main PID: 3498
      Tasks: 35 (limit: 9242)
     Memory: 168.9M
        CPU: 8.240s
     CGroup: /user.slice/user-7002.slice/user@7002.service/app.slice/mykomap-backend.service
             ├─3498 "npm run start:attached" "" "" "" "" "" "" "" "" "" "" "" "" "" "" "" "" "" "" "" "" "" "" "" "" "" "" "" "" "" "" "" "" "" "" "" "" "" "" "" "" "" "" "" "" "" "" "" "" "" "" "" "" ""
             ├─3643 sh -c "npm run start"
             ├─3644 "npm run start" "" "" "" "" "" "" "" "" "" "" "" "" "" "" "" "" "" "" "" "" "" "" "" "" "" "" "" "" "" "" "" "" "" "" "" "" "" "" "" "" "" "" "" "" "" "" "" "" "" "" "" "" ""
             ├─3682 sh -c "node ./start.js"
             └─3683 node ./start.js

root@dev-2:~# systemctl --machine broccoli@.host --user  restart mykomap-backend

root@dev-2:~# systemctl --machine broccoli@.host --user  start mykomap-backend

root@dev-2:~# systemctl --machine broccoli@.host --user  status mykomap-backend
● mykomap-backend.service - Mykomap back-end process manager for broccoli
     Loaded: loaded (/home/broccoli/.config/systemd/user/mykomap-backend.service; enabled; vendor preset: enabled)
     Active: active (running) since Sun 2024-11-24 17:48:10 UTC; 8s ago
       Docs: https://github.com/DigitalCommons/mykomap-monolith/
   Main PID: 4056
      Tasks: 35 (limit: 9242)
     Memory: 196.5M
        CPU: 2.977s
     CGroup: /user.slice/user-7002.slice/user@7002.service/app.slice/mykomap-backend.service
             ├─4056 "npm run start:attached" "" "" "" "" "" "" "" "" "" "" "" "" "" "" "" "" "" "" "" "" "" "" "" "" "" "" "" "" "" "" "" "" "" "" "" "" "" "" "" "" "" "" "" "" "" "" "" "" "" "" "" "" ""
             ├─4203 sh -c "npm run start"
             ├─4204 "npm run start" "" "" "" "" "" "" "" "" "" "" "" "" "" "" "" "" "" "" "" "" "" "" "" "" "" "" "" "" "" "" "" "" "" "" "" "" "" "" "" "" "" "" "" "" "" "" "" "" "" "" "" "" ""
             ├─4242 sh -c "node ./start.js"
             └─4243 node ./start.js
```

